"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SessionBadge } from "@/components/auth/session-badge";
import { IconScales } from "@/components/icons";

const MODE_STORAGE_KEY = "bm-mode";
const MODE_VERSION_KEY = "bm-mode-version";
/* Bump when the default landing mode changes — resets stored preference once. */
const MODE_VERSION = "2";

/* Sidebar: Author / Operator mode toggle swaps the nav set. Operator is the
   default landing (dashboard); Author is the course-building surface. Mode
   persists in localStorage; route-specific paths force the matching mode. */

type NavMode = "author" | "operator";

type NavItem = {
  label: string;
  href: string;
  dot: string;
  count?: string;
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

const OPERATOR_ROUTES = new Set([
  "dashboard",
  "courses",
  "sync",
  "integrity",
  "files",
  "supabase-data",
  "settings",
]);

const AUTHOR_ROUTES = new Set([
  "course-studio",
  "guide",
  "building-blocks",
  "publish",
  "faculty",
  "my-courses",
]);

const AUTHOR_NAV: NavGroup[] = [
  {
    label: null,
    items: [{ label: "Course Studio", href: "/course-studio/", dot: "var(--cat-violet)" }],
  },
  {
    label: "Reference",
    items: [
      { label: "How to build a course", href: "/guide/", dot: "var(--cat-amber)" },
      { label: "Building blocks", href: "/building-blocks/", dot: "var(--cat-blue)" },
      { label: "Publish workflow", href: "/publish/", dot: "var(--cat-green)" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Faculty", href: "/faculty/", dot: "var(--cat-teal)" },
      { label: "How my courses are doing", href: "/my-courses/", dot: "var(--cat-green)" },
    ],
  },
];

const OPERATOR_NAV: NavGroup[] = [
  {
    label: null,
    items: [{ label: "Dashboard", href: "/dashboard/", dot: "var(--accent)" }],
  },
  {
    label: "Monitor",
    items: [
      { label: "Course Inventory", href: "/courses/", dot: "var(--cat-blue)" },
      { label: "Sync Diagnostics", href: "/sync/", dot: "var(--cat-amber)" },
      { label: "Integrity Checker", href: "/integrity/", dot: "var(--cat-teal)" },
      { label: "Learner Progress", href: "/learners/", dot: "var(--cat-green)" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { label: "Brightspace Files", href: "/files/", dot: "var(--cat-violet)" },
      { label: "Supabase Data", href: "/supabase-data/", dot: "var(--cat-pink)" },
      { label: "Settings", href: "/settings/", dot: "var(--ink-soft)" },
    ],
  },
];

function routeMode(pathname: string): NavMode | null {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (OPERATOR_ROUTES.has(segment)) return "operator";
  if (AUTHOR_ROUTES.has(segment)) return "author";
  return null;
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: NavMode;
  onChange: (mode: NavMode) => void;
}) {
  return (
    <div className="px-3 pb-2 pt-0.5">
      <div className="flex gap-[3px] rounded-[9px] border border-line bg-surface-sunken p-[3px]">
        {(["operator", "author"] as const).map((value) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`flex-1 rounded-[7px] py-[7px] text-[12px] font-semibold capitalize transition-colors ${
                active
                  ? "bg-accent text-white shadow-[0_2px_8px_var(--accent-glow)]"
                  : "bg-transparent text-ink-soft hover:text-ink-muted"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] transition-colors duration-100 ${
          active
            ? "bg-[var(--accent-tint)] font-semibold text-ink"
            : "font-medium text-ink-muted hover:bg-sb-hover hover:text-ink"
        }`}
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
          style={{ background: active ? "var(--accent)" : item.dot }}
          aria-hidden
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.count ? (
          <span className="font-mono text-[11px] text-ink-soft">{item.count}</span>
        ) : null}
      </Link>
    </li>
  );
}

export function Sidebar({ hidden = false }: { hidden?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const forcedMode = routeMode(pathname);
  const [mode, setMode] = useState<NavMode>(() => forcedMode ?? "operator");

  useEffect(() => {
    const version = localStorage.getItem(MODE_VERSION_KEY);
    if (version !== MODE_VERSION) {
      localStorage.setItem(MODE_VERSION_KEY, MODE_VERSION);
      localStorage.setItem(MODE_STORAGE_KEY, "operator");
      if (forcedMode) {
        setMode(forcedMode);
      } else {
        setMode("operator");
      }
      return;
    }
    if (forcedMode) {
      setMode(forcedMode);
      return;
    }
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === "author" || stored === "operator") setMode(stored);
  }, [forcedMode]);

  function switchMode(next: NavMode) {
    if (next === mode) return;
    setMode(next);
    localStorage.setItem(MODE_STORAGE_KEY, next);
    router.push(next === "author" ? "/course-studio/" : "/dashboard/");
  }

  const navGroups = mode === "author" ? AUTHOR_NAV : OPERATOR_NAV;

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-hidden border-b border-line bg-surface transition-[width,opacity] duration-200 ease-in-out md:border-b-0 md:border-r ${
        hidden ? "pointer-events-none h-0 opacity-0 md:h-auto md:w-0" : "max-h-[198px] w-full md:max-h-none md:w-[236px]"
      }`}
      aria-hidden={hidden}
    >
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-3 md:pb-4 md:pt-[18px]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-surface">
          <IconScales size={17} />
        </span>
        <span className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink">LACE</span>
      </div>

      <ModeToggle mode={mode} onChange={switchMode} />

      <nav
        className="flex gap-2 overflow-x-auto px-[11px] pb-2 pt-1 md:flex-1 md:flex-col md:gap-0 md:overflow-y-auto md:pb-1.5"
        aria-label="Main navigation"
      >
        {navGroups.map((group) => (
          <div key={group.label ?? "top"} className="mb-1.5 shrink-0">
            {group.label ? (
              <p className="hidden px-2 pb-1.5 pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.11em] text-ink-soft md:block">
                {group.label}
              </p>
            ) : null}
            <ul className="flex gap-1 md:flex-col md:gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="hidden md:block">
        <SessionBadge />
      </div>
    </aside>
  );
}
