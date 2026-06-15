"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconScales, IconSearch } from "@/components/icons";
import { SessionBadge } from "@/components/auth/session-badge";

/* Sidebar — cool direction. One rail, two audiences. Themed surface (no longer
   a permanent dark rail): in dark mode it's the dark surface, in light mode
   white. Brand row + decorative search + segmented Author/Operator toggle +
   grouped nav with category dots + identity chip. The mode toggle is sticky
   (localStorage) and route-aware: landing on an operator-only page flips the
   rail to operator mode. */

type Mode = "author" | "operator";

type NavItem = {
  label: string;
  href: string;
  dot: string; // category palette colour
  count?: string;
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
      { label: "Home", href: "/", dot: "var(--cat-blue)" },
      { label: "Course Studio", href: "/course-studio/", dot: "var(--cat-violet)" },
      { label: "How everyone's doing", href: "/learners/", dot: "var(--cat-green)" },
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
    label: "Under the hood",
    items: [
      { label: "Manage Files", href: "/files/", dot: "var(--cat-violet)" },
      { label: "Supabase Data", href: "/supabase-data/", dot: "var(--cat-pink)" },
      { label: "Settings", href: "/settings/", dot: "var(--ink-soft)" },
    ],
  },
];

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
  if (pathname === "/" || pathname.startsWith("/course-studio")) return "author";
  /* shared routes (/learners): keep the current mode */
  return null;
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
      className={`flex shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-[width,opacity] duration-200 ease-in-out ${
        hidden ? "pointer-events-none w-0 opacity-0" : "w-[236px]"
      }`}
      aria-hidden={hidden}
    >
      {/* Brand row */}
      <div className="flex items-center gap-2.5 px-4 pb-4 pt-[18px]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-surface">
          <IconScales size={17} />
        </span>
        <span className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink">LACE</span>
        <span className="ml-auto rounded-[5px] bg-[var(--accent-tint)] px-[7px] py-[3px] font-mono text-[9.5px] font-semibold tracking-[0.08em] text-accent">
          OPS
        </span>
      </div>

      {/* Decorative search */}
      <div className="px-3 pb-3">
        <div className="flex h-9 items-center gap-2 rounded-[9px] border border-line bg-surface-sunken px-[11px]">
          <IconSearch size={14} className="shrink-0 text-ink-soft" />
          <span className="flex-1 text-[12.5px] text-ink-soft">Search</span>
          <span className="rounded-[4px] border border-line px-[5px] py-px font-mono text-[10px] text-ink-soft">
            ⌘K
          </span>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="px-3 pb-1">
        <div
          className="flex gap-[3px] rounded-[9px] border border-line bg-surface-sunken p-[3px]"
          role="tablist"
        >
          {(["author", "operator"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-[7px] py-[7px] text-[12px] font-semibold capitalize transition-colors duration-100 ${
                mode === m
                  ? "bg-accent text-white shadow-[0_2px_8px_var(--accent-glow)]"
                  : "text-ink-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col overflow-y-auto px-[11px] pb-1.5 pt-3"
        aria-label="Main navigation"
      >
        {groups.map((group) => (
          <div key={group.label ?? "top"} className="mb-1.5">
            {group.label ? (
              <p className="px-2 pb-1.5 pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.11em] text-ink-soft">
                {group.label}
              </p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Identity chip */}
      <SessionBadge />
    </aside>
  );
}
