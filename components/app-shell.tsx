"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

function isBuilderRoute(pathname: string) {
  return /^\/course-studio\/[^/]+\/?$/.test(pathname);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isBuilderRoute(pathname)) {
    return <main className="flex h-dvh flex-col overflow-hidden bg-paper">{children}</main>;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar />
        <main
          id="main-content"
          tabIndex={-1}
          key={pathname}
          className="min-w-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 md:pb-20 lg:px-8 lg:pt-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
