import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <main className="ml-16 min-h-screen lg:ml-60">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
