"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import { isAuthConfigured } from "@/lib/auth/config";

/* Sidebar identity chip (cool direction): accent avatar + who's signed in +
   sign out. In open mock/dev mode (no auth configured) it shows a neutral
   "mock data" chip instead so the rail footer is never empty. */

function initials(email: string) {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = (parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2)) || "";
  return letters.toUpperCase();
}

export function SessionBadge() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.assign("/sign-in/");
  }

  if (!email) {
    return (
      <div className="flex items-center gap-2.5 border-t border-line px-3.5 py-3">
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-surface-sunken font-mono text-[10px] font-bold text-ink-soft">
          BM
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold leading-tight text-ink">
            Mock / dev mode
          </span>
          <span className="block font-mono text-[10px] text-ink-soft">read-only · no sign-in</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 border-t border-line px-3.5 py-3">
      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-accent text-[11px] font-bold text-white">
        {initials(email)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold leading-tight text-ink" title={email}>
          {email}
        </span>
        <span className="block font-mono text-[10px] text-ink-soft">MLRI · admin</span>
      </span>
      <button
        onClick={() => void signOut()}
        className="shrink-0 font-mono text-[10px] font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        Sign out
      </button>
    </div>
  );
}
