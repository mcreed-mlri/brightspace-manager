"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import { isAuthConfigured } from "@/lib/auth/config";

type Step = "email" | "code";

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30";

/* Supabase's built-in email sender allows only ~2 emails/hour, so failed
   sends must say WHY (a misleading "check the address" burns retries) and
   successful sends start a cooldown so double-clicks don't burn the budget. */
function sendErrorMessage(raw: string): string {
  const message = raw.toLowerCase();
  if (message.includes("signup")) {
    return "This email isn't on the team list yet. Ask Marlie to send you an invite.";
  }
  if (message.includes("security purposes")) {
    /* "For security purposes, you can only request this after N seconds." */
    return `Too many requests: ${raw.replace("For security purposes, you", "you")}`;
  }
  if (message.includes("rate limit")) {
    return "Supabase's email limit is used up (the built-in sender allows ~2 emails per hour). Wait an hour and try again. Your last code may still work below.";
  }
  return `Couldn't send the code: ${raw}`;
}

export function SignInCard() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  /* The OAuth callback bounces failures back here as ?error=… (e.g. Google
     blocked by the org admin). Show it, then clean the URL. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (!oauthError) return;
    setError(
      `Google sign-in didn't complete: ${oauthError}. You can still use a sign-in code below.`,
    );
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback/`,
        /* Always show the account chooser so a shared machine can switch users. */
        queryParams: { prompt: "select_account" },
      },
    });
    /* On success the browser has already navigated to Google; we only reach
       here on failure to even start the flow. */
    if (oauthError) {
      setBusy(false);
      setError(`Couldn't start Google sign-in: ${oauthError.message}`);
    }
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    /* shouldCreateUser: false keeps the app invite-only even if the
       dashboard "allow signups" toggle is ever flipped by mistake. */
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (otpError) {
      setError(sendErrorMessage(otpError.message));
      /* A code from an earlier email is still valid for an hour — let her
         try it even when this send failed on the rate limit. */
      if (otpError.message.toLowerCase().includes("rate limit")) setStep("code");
      return;
    }
    setCooldown(60);
    setStep("code");
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    if (verifyError) {
      setBusy(false);
      setError(
        verifyError.message.toLowerCase().includes("expired")
          ? "That code has expired. Send yourself a new one."
          : "That code didn't work. Double-check it, or send yourself a new one.",
      );
      return;
    }
    /* Full reload so the fresh session cookie reaches the middleware. */
    localStorage.setItem("bm-mode", "operator");
    localStorage.setItem("bm-mode-version", "2");
    window.location.assign("/dashboard/");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper px-5">
      <div className="editorial-card w-full max-w-sm bg-surface p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand font-mono text-xs font-semibold text-white">
            BM
          </span>
          <span>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-soft">
              LACE
            </span>
            <span className="block text-sm font-semibold text-ink">Brightspace Manager</span>
          </span>
        </div>

        {!isAuthConfigured() ? (
          <p className="text-sm text-ink-muted">
            Sign-in isn&apos;t configured in this environment, so the app is running in open
            mock/dev mode. You can close this page and use the app directly.
          </p>
        ) : step === "email" ? (
          <>
            <h1 className="text-lg font-semibold text-ink">Sign in</h1>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-sb-hover disabled:opacity-60"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
                />
              </svg>
              {busy ? "Redirecting…" : "Continue with Google"}
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
              <span className="h-px flex-1 bg-line" />
              or use a sign-in code
              <span className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={sendCode}>
              <p className="text-sm text-ink-muted">
                No password needed. We&apos;ll email you a one-time code.
              </p>
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Work email
              <input
                autoFocus
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mlri.org"
                className={`${inputClass} mt-1.5 font-normal normal-case tracking-normal`}
              />
            </label>
            <button type="submit" disabled={busy || !email.trim()} className="btn-primary mt-5 w-full justify-center px-4 py-2 text-sm">
              {busy ? "Sending…" : "Email me a sign-in code"}
            </button>
            </form>
          </>
        ) : (
          <form onSubmit={verifyCode}>
            <h1 className="text-lg font-semibold text-ink">Check your email</h1>
            <p className="mt-1 text-sm text-ink-muted">
              We sent a sign-in code to <span className="font-medium text-ink">{email}</span>. It
              may take a minute to arrive.
            </p>
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Sign-in code
              <input
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="12345678"
                className={`${inputClass} mt-1.5 font-mono text-base tracking-[0.3em]`}
              />
            </label>
            {/* Supabase's OTP length is a project setting (6–10 digits; this
                project sends 8) — accept the range rather than hardcoding. */}
            <button type="submit" disabled={busy || code.length < 6} className="btn-primary mt-5 w-full justify-center px-4 py-2 text-sm">
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button
              type="button"
              disabled={cooldown > 0}
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="mt-3 w-full text-center text-xs font-medium text-ink-muted hover:text-ink disabled:cursor-default disabled:opacity-60"
            >
              {cooldown > 0
                ? `Code sent. You can resend in ${cooldown}s`
                : "Use a different email or resend the code"}
            </button>
          </form>
        )}

        {error ? (
          <p className="mt-4 rounded-lg bg-status-error-soft px-3 py-2 text-sm text-status-error-ink">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
