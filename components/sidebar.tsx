"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionBadge } from "@/components/auth/session-badge";
import { IconScales } from "@/components/icons";

/* Sidebar: one steady rail for the full admin surface. Dashboard stays first,
   course authoring sits just beneath it, then monitoring and under-the-hood tools. */

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

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ label: "Dashboard", href: "/dashboard/", dot: "var(--accent)" }],
  },
  {
    label: "Create",
    items: [
      { label: "Home", href: "/", dot: "var(--cat-blue)" },
      { label: "Course Studio", href: "/course-studio/", dot: "var(--cat-violet)" },
    ],
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

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-[width,opacity] duration-200 ease-in-out ${
        hidden ? "pointer-events-none w-0 opacity-0" : "w-[236px]"
      }`}
      aria-hidden={hidden}
    >
      <div className="flex items-center gap-2.5 px-4 pb-4 pt-[18px]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-surface">
          <IconScales size={17} />
        </span>
        <span className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink">LACE</span>
        <span className="ml-auto rounded-[5px] bg-[var(--accent-tint)] px-[7px] py-[3px] font-mono text-[9.5px] font-semibold tracking-[0.08em] text-accent">
          OPS
        </span>
      </div>

      <nav
        className="flex flex-1 flex-col overflow-y-auto px-[11px] pb-1.5 pt-1"
        aria-label="Main navigation"
      >
        {NAV_GROUPS.map((group) => (
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

      <SessionBadge />
    </aside>
  );
}
