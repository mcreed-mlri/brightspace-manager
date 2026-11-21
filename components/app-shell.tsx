"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NavModeProvider } from "@/components/nav-mode";
import { PhoneBar, SideRail } from "@/components/side-rail";
import { TopBar } from "@/components/top-bar";

function isBuilderRoute(pathname: string) {
  return /^\/course-studio\/[^/]+\/?$/.test(pathname);
}

/* The Training Hub's shell shape: the masthead across the top, the narrow
   rail down the left on desktop, and the same tiles in a bottom bar on a
   phone. The full-screen builder opts out of all of it. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isBuilderRoute(pathname)) {
    return <main className="flex h-dvh flex-col overflow-hidden bg-paper">{children}</main>;
  }

  return (
    <NavModeProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-paper">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <SideRail />
          <main
            id="main-content"
            tabIndex={-1}
            key={pathname}
            className="min-w-0 flex-1 overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-[1120px] px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-6 md:pb-20 lg:px-10 lg:pt-10">
              {children}
            </div>
          </main>
        </div>
        <PhoneBar />
      </div>
    </NavModeProvider>
  );
}
