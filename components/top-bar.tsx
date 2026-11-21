"use client";

import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { IconScales } from "@/components/icons";
import { useNavMode } from "@/components/nav-mode";

const trainingHubUrl = process.env.NEXT_PUBLIC_TRAINING_HUB_URL;

/* The Training Hub pill shows from `sm` up; on a phone the same link is in
   the account menu, so the name keeps its room.

   The masthead, built like the Training Hub's (its studio-content-bar.tsx and
   brand-lockup.tsx): on paper with a heavy ink rule under it, the lockup at
   the far left and the account circle in the top-right corner. The lockup's
   small line names the current mode, as the Hub's does for Supervisor mode.
   On desktop the mark sits over the rail's icons. */
export function TopBar() {
  const { mode } = useNavMode();
  return (
    <header className="studio-masthead flex min-h-[60px] shrink-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:min-h-[70px]">
      <Link href="/dashboard/" className="flex min-w-0 items-center gap-2.5 rounded-[10px]">
        <span
          aria-hidden="true"
          className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-ink text-paper"
        >
          <IconScales size={21} strokeWidth={2.2} />
        </span>
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            {mode === "author" ? "Author" : "Operator"}
          </span>
          <span className="mt-[3px] truncate text-[17px] font-extrabold tracking-[-0.03em] sm:text-[19px]">
            Brightspace Manager
          </span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-3">
        {trainingHubUrl ? (
          <a
            href={trainingHubUrl}
            className="hub-link hidden min-h-10 items-center whitespace-nowrap px-4 text-[13px] font-semibold sm:inline-flex"
          >
            Training Hub{" "}
            <span className="ml-1" aria-hidden="true">
              ↗
            </span>
          </a>
        ) : null}
        <AccountMenu />
      </div>
    </header>
  );
}
