"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconUser } from "@/components/icons";
import type { NavMode } from "@/components/nav-items";
import { useNavMode } from "@/components/nav-mode";
import { useTheme } from "@/components/theme-provider";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import { isAuthConfigured } from "@/lib/auth/config";

const trainingHubUrl = process.env.NEXT_PUBLIC_TRAINING_HUB_URL;

/* The account circle in the top-right corner, as in the Training Hub (its
   components/account-menu.tsx): a sky circle with an ink ring. It opens a
   small panel with who is signed in, the Operator / Author mode, the light /
   dark choice, and sign out. In open mock/dev mode (no auth configured) the
   circle shows a person glyph and the panel says so. */

function initials(email: string) {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = (parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2)) || "";
  return letters.toUpperCase();
}

const modes: { value: NavMode; label: string }[] = [
  { value: "operator", label: "Operator" },
  { value: "author", label: "Author" },
];

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

function Segmented<T extends string>({
  label,
  options,
  current,
  onPick,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  current: T;
  onPick: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="border-t border-line px-2.5 pb-2 pt-2.5">
      <p className="pb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {options.map((option) => {
          const active = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(option.value)}
              className={`min-h-11 rounded-[8px] px-2 text-[13px] font-semibold transition-colors ${
                active
                  ? "is-selected"
                  : "text-ink-muted hover:bg-[var(--hover-wash)] hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AccountMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { mode, switchMode } = useNavMode();
  const { theme, setTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const nameId = useId();

  useEffect(() => {
    if (!isAuthConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  /* Escape or a click outside closes it; opening moves focus into the panel
     and Escape hands it back to the circle. */
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.assign("/sign-in/");
  }

  const label = email ? `${initials(email)}, Account menu for ${email}` : "Account menu";

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (open && !rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="masthead-avatar grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12.5px] font-bold transition-opacity hover:opacity-90"
      >
        {email ? initials(email) : <IconUser size={18} />}
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-labelledby={nameId}
          className="confirm-pop absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-[12px] border border-line bg-surface-raised p-1.5 shadow-[var(--shadow-lg)]"
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--feature-action-bg)] text-[11px] font-bold text-[var(--feature-action-ink)]">
              {email ? initials(email) : <IconUser size={15} />}
            </span>
            <div className="min-w-0 leading-tight">
              <p
                id={nameId}
                className="truncate text-[13px] font-semibold text-ink"
                title={email ?? undefined}
              >
                {email ?? "Mock / dev mode"}
              </p>
              <p className="truncate text-[11px] text-ink-soft">
                {email ? "MLRI · admin" : "Read-only, no sign-in"}
              </p>
            </div>
          </div>
          <Segmented
            label="Mode"
            options={modes}
            current={mode}
            onPick={(value) => {
              setOpen(false);
              switchMode(value);
            }}
          />
          {/* The menu stays open so the theme change can be seen first. */}
          <Segmented label="Display" options={themes} current={theme} onPick={setTheme} />
          {trainingHubUrl ? (
            <a
              href={trainingHubUrl}
              className="flex min-h-11 w-full items-center justify-between rounded-[8px] border-t border-line px-[11px] text-[13px] font-semibold text-ink-muted transition-colors hover:bg-[var(--hover-wash)] hover:text-ink"
            >
              Training Hub
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {email ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-0.5 flex min-h-11 w-full items-center rounded-[8px] border-t border-line px-[11px] text-left text-[13px] font-semibold text-ink-soft transition-colors hover:bg-[var(--hover-wash)] hover:text-ink"
            >
              Sign out
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
