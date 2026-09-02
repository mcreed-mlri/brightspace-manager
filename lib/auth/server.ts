import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSupabaseAuthEnv, isAuthConfigured } from "@/lib/auth/config";
import type { ApiErr } from "@/types/api";

export type SessionUser = {
  id: string;
  email: string;
};

/* Google sign-ins auto-create a Supabase user for ANY Google account that
   completes the flow — the OTP path's invite-only guard (shouldCreateUser:
   false) does NOT cover them. This is the real gate: only emails on the
   configured org domain(s) are allowed in. Set AUTH_ALLOWED_EMAIL_DOMAINS to a
   comma-separated list (e.g. "ebhcs.org,mlri.org"). When it is unset, no domain
   restriction is applied, so the app stays open in dev/mock. */
export function isAllowedOrgEmail(email: string | null | undefined): boolean {
  const raw = process.env["AUTH_ALLOWED_EMAIL_DOMAINS"]?.trim();
  if (!raw) return true;
  const domain = email?.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  const allowed = raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(domain);
}

async function createSupabaseAuthClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseAuthEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* Called from a Server Component, where cookies are read-only.
             Middleware handles session refresh, so this is safe to ignore. */
        }
      },
    },
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isAuthConfigured()) return null;

  const supabase = await createSupabaseAuthClient();
  /* getUser() validates the JWT against Supabase — never trust getSession()
     alone on the server. */
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? data.user.id };
}

export type AuthCheck =
  | { ok: true; user: SessionUser | null }
  | { ok: false; response: NextResponse<ApiErr> };

function authError(message: string, status: number): AuthCheck {
  const body: ApiErr = {
    ok: false,
    error: { message, status },
  };
  return { ok: false, response: NextResponse.json(body, { status }) };
}

/* Defense in depth: every API route calls this even though middleware already
   gates requests — middleware alone is bypassable (cf. CVE-2025-29927).
   `user` is null only when auth is unconfigured (open mock/dev mode). */
export async function requireUser(): Promise<AuthCheck> {
  if (!isAuthConfigured()) return { ok: true, user: null };

  let user: SessionUser | null;
  try {
    user = await getSessionUser();
  } catch (error) {
    console.warn("Supabase auth is configured but could not initialize.", error);
    return authError("Authentication service unavailable.", 503);
  }

  if (!user) {
    return authError("Sign-in required.", 401);
  }

  return { ok: true, user };
}
