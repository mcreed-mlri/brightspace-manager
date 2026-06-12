"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  IconCourses,
  IconDashboard,
  IconDatabase,
  IconFiles,
  IconHome,
  IconLearners,
  IconSettings,
  IconShield,
  IconStudio,
  IconSync,
} from "@/components/icons";
import { SessionBadge } from "@/components/auth/session-badge";

/* Dark rail per design handoff v3: one sidebar, two audiences. Author mode
   shows just the essentials for attorneys; Operator mode is the full
   monitoring console. The toggle is sticky (localStorage) and route-aware:
   landing on an operator-only page flips the rail to operator mode. */

type Mode = "author" | "operator";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
};

type NavGroup = {
  /* null = no eyebrow label (the everyday items at the top) */
  label: string | null;
  items: NavItem[];
};

const AUTHOR_NAV: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Home", href: "/", icon: IconHome },
      { label: "Course Studio", href: "/course-studio/", icon: IconStudio },
      { label: "How everyone's doing", href: "/learners/", icon: IconLearners },
    ],
  },
];

const OPERATOR_NAV: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/dashboard/", icon: IconDashboard },
      { label: "Course Studio", href: "/course-studio/", icon: IconStudio },
    ],
  },
  {
    label: "Monitor",
    items: [
      { label: "Course Inventory", href: "/courses/", icon: IconCourses },
      { label: "Sync Diagnostics", href: "/sync/", icon: IconSync },
      { label: "Integrity Checker", href: "/integrity/", icon: IconShield },
      { label: "Learner Progress", href: "/learners/", icon: IconLearners },
    ],
  },
  {
    label: "Under the hood",
    items: [
      { label: "Manage Files", href: "/files/", icon: IconFiles },
      { label: "Supabase Data", href: "/supabase-data/", icon: IconDatabase },
    ],
  },
];

const SETTINGS_ITEM: NavItem = { label: "Settings", href: "/settings/", icon: IconSettings };

const MODE_SUBTITLE: Record<Mode, string> = {
  author: "Just the essentials: build courses and see how learners are doing.",
  operator: "Full console: connections, sync, files and the cache.",
};

const OPERATOR_PREFIXES = [
  "/dashboard",
  "/courses",
  "/sync",
  "/integrity",
  "/files",
  "/supabase-data",
  "/settings",
];

function deriveMode(pathname: string): Mode | null {
  if (OPERATOR_PREFIXES.some((p) => pathname.startsWith(p))) return "operator";
  if (pathname === "/") return "author";
  /* shared routes (/course-studio, /learners): keep the current mode */
  return null;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex w-full items-center gap-[9px] rounded-[7px] px-2.5 py-2 text-[13px] transition-colors duration-100 ${
          active
            ? "bg-sb-active font-semibold text-white"
            : "font-medium text-sb-ink hover:bg-sb-hover"
        }`}
      >
        <Icon size={16} className={`shrink-0 ${active ? "opacity-100" : "opacity-60"}`} />
        {item.label}
      </Link>
    </li>
  );
}

export function Sidebar({ hidden = false }: { hidden?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [storedMode, setStoredMode] = useState<Mode>("author");

  const mode = deriveMode(pathname) ?? storedMode;

  /* Remember the last concrete mode so shared routes (Studio, learners)
     keep the rail the user came from — across visits too. */
  useEffect(() => {
    const derived = deriveMode(pathname);
    if (derived) {
      setStoredMode(derived);
      window.localStorage.setItem("bm-mode", derived);
    } else {
      const saved = window.localStorage.getItem("bm-mode");
      if (saved === "author" || saved === "operator") setStoredMode(saved);
    }
  }, [pathname]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setStoredMode(next);
    window.localStorage.setItem("bm-mode", next);
    router.push(next === "author" ? "/" : "/dashboard/");
  }

  const groups = mode === "author" ? AUTHOR_NAV : OPERATOR_NAV;

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-hidden bg-sb transition-[width,opacity] duration-200 ease-in-out ${
        hidden ? "pointer-events-none w-0 opacity-0" : "w-[232px]"
      }`}
      aria-hidden={hidden}
    >
      <div className="flex items-center gap-2.5 border-b border-sb-line px-4 pb-3.5 pt-[17px]">
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-brand-fill font-mono text-[11px] font-bold text-white">
          BM
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase leading-none tracking-[0.09em] text-sb-muted">
            LACE
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-bold leading-tight tracking-[-0.01em] text-white">
            Brightspace Manager
          </span>
        </span>
      </div>

      <div className="flex gap-1 border-b border-sb-line px-3.5 pb-3 pt-2.5" role="tablist">
        {(["author", "operator"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`flex-1 rounded-[7px] py-1.5 text-[12.5px] font-semibold capitalize transition-colors duration-100 ${
              mode === m
                ? "bg-white/[0.13] text-white"
                : "text-sb-muted hover:bg-sb-hover hover:text-sb-ink"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <p className="px-4 pt-2.5 text-[11.5px] italic leading-normal text-sb-muted">
        {MODE_SUBTITLE[mode]}
      </p>

      <nav
        className="flex flex-1 flex-col gap-px overflow-y-auto px-2.5 pb-1.5 pt-2"
        aria-label="Main navigation"
      >
        {groups.map((group) => (
          <div key={group.label ?? "top"}>
            {group.label ? (
              <p className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-sb-muted">
                {group.label}
              </p>
            ) : null}
            <ul className="flex flex-col gap-px">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
              ))}
            </ul>
          </div>
        ))}
        {mode === "operator" ? (
          <>
            <div className="flex-1" aria-hidden />
            <ul className="mt-1">
              <NavLink item={SETTINGS_ITEM} active={isActive(pathname, SETTINGS_ITEM.href)} />
            </ul>
          </>
        ) : null}
      </nav>

      <SessionBadge />

      <div className="flex items-center gap-[7px] border-t border-sb-line px-3 py-2.5">
        <span className="h-[7px] w-[7px] shrink-0 animate-pulse rounded-full bg-status-ok" aria-hidden />
        <span className="text-[11px] text-sb-muted">v0.3 · writes: sync only</span>
      </div>
    </aside>
  );
}
