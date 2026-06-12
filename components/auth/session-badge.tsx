"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import { isAuthConfigured } from "@/lib/auth/config";

/* Sidebar footer: who is signed in + sign out. Renders nothing in open
   mock/dev mode (no auth configured). */
export function SessionBadge() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  if (!email) return null;

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.assign("/sign-in/");
  }

  return (
    <div className="flex items-center justify-between gap-2 border-t border-sb-line px-4 py-2.5">
      <span className="min-w-0 truncate text-[11px] text-sb-muted" title={email}>
        {email}
      </span>
      <button
        onClick={() => void signOut()}
        className="shrink-0 text-[11px] font-semibold text-sb-ink hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
}
