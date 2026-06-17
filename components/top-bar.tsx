"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-provider";

/* Top bar — cool direction. 60px, surface, hairline bottom border. Left: a
   mono breadcrumb derived from the route (e.g. "operator / dashboard"). Right:
   the global theme toggle. Page-specific primary actions live in each page's
   own header. Hidden on the full-screen builder route, which owns its own
   header. */

const SECTION: Record<string, { mode: "author" | "operator" | "lace"; label: string }> = {
  dashboard: { mode: "operator", label: "dashboard" },
  author: { mode: "author", label: "home" },
  courses: { mode: "operator", label: "course inventory" },
  sync: { mode: "operator", label: "sync diagnostics" },
  integrity: { mode: "operator", label: "integrity checker" },
  files: { mode: "operator", label: "brightspace files" },
  "supabase-data": { mode: "operator", label: "supabase data" },
  settings: { mode: "operator", label: "settings" },
  "course-studio": { mode: "author", label: "course studio" },
  learners: { mode: "lace", label: "learner progress" },
  "sign-in": { mode: "lace", label: "sign in" },
};

function breadcrumb(pathname: string) {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  const entry = SECTION[first] ?? { mode: "lace" as const, label: first || "home" };
  return `${entry.mode} / ${entry.label}`;
}

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-3.5 border-b border-line bg-surface px-4 md:h-[60px] md:px-7">
      <span className="min-w-0 truncate font-mono text-[11px] tracking-[0.04em] text-ink-soft">
        {breadcrumb(pathname)}
      </span>
      <div className="ml-auto flex items-center gap-2.5">
        <ThemeToggle />
      </div>
    </header>
  );
}
