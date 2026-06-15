"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

/* App shell — cool direction: full-viewport flex row, themed sidebar + a 60px
   top bar over scrolling content. The Studio builder
   ( /course-studio/[draftId] ) is a full-screen editor — the sidebar and top
   bar slide away and the page owns the whole viewport with no padding. */

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
          <>
            <TopBar />
            <div key={pathname} className="fade-up flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[1000px] px-9 pb-20 pt-9">{children}</div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
