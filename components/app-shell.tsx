"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

/* App shell per design handoff v3: full-viewport flex row, dark rail +
   scrolling content. The Studio builder ( /course-studio/[draftId] ) is a
   full-screen editor — the sidebar slides away and the page owns the
   whole viewport with no padding. */

function isBuilderRoute(pathname: string) {
  return /^\/course-studio\/[^/]+\/?$/.test(pathname);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const builder = isBuilderRoute(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar hidden={builder} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {builder ? (
          children
        ) : (
          <div key={pathname} className="fade-up flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-11 pb-16 pt-9">{children}</div>
          </div>
        )}
      </main>
    </div>
  );
}
