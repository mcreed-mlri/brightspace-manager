"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  IconCourses,
  IconDashboard,
  IconDatabase,
  IconFiles,
  IconSettings,
  IconShield,
  IconStudio,
  IconSync,
} from "@/components/icons";

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

/* Grouped for non-technical teammates: the everyday tools live at the top,
   the under-the-hood tools sit lower. Settings is pinned at the bottom. */
const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/", icon: IconDashboard },
      { label: "Course Studio", href: "/course-studio/", icon: IconStudio },
    ],
  },
  {
    label: "Monitor",
    items: [
      { label: "Course Inventory", href: "/courses/", icon: IconCourses },
      { label: "Sync Diagnostics", href: "/sync/", icon: IconSync },
      { label: "Integrity Checker", href: "/integrity/", icon: IconShield },
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
        title={item.label}
        className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors lg:px-3 ${
          active ? "nav-link-active" : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
        }`}
      >
        <Icon size={18} className="shrink-0" />
        <span className="hidden lg:inline">{item.label}</span>
      </Link>
    </li>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-line bg-surface lg:w-60">
      <div className="flex items-center gap-2.5 border-b border-line px-3 py-4 lg:px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand font-mono text-xs font-semibold text-white">
          BM
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-soft">
            LACE
          </span>
          <span className="block truncate text-sm font-semibold text-ink">Brightspace Manager</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 lg:px-3" aria-label="Main navigation">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label ?? "top"} className={groupIndex > 0 ? "mt-5" : ""}>
            {group.label ? (
              <>
                <p className="mb-1.5 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft lg:block">
                  {group.label}
                </p>
                <div className="mb-1.5 border-t border-line-soft lg:hidden" aria-hidden />
              </>
            ) : null}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-2 py-2 lg:px-3">
        <ul>
          <NavLink item={SETTINGS_ITEM} active={isActive(pathname, SETTINGS_ITEM.href)} />
        </ul>
      </div>

      <div className="border-t border-line px-3 py-3 lg:px-5">
        <span className="hidden items-center gap-2 text-[11px] text-ink-soft lg:flex">
          <span className="h-2 w-2 rounded-full bg-status-ok" aria-hidden />
          v0.2 · writes: sync only
        </span>
        <span className="flex justify-center lg:hidden">
          <span className="h-2 w-2 rounded-full bg-status-warn" aria-hidden />
        </span>
      </div>
    </aside>
  );
}
