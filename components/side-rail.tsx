"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTHOR_NAV, OPERATOR_NAV, isNavItemActive, type NavItem } from "@/components/nav-items";
import { useNavMode } from "@/components/nav-mode";

/* Navigation in the Training Hub's shape (its components/studio-rail.tsx and
   nav-tile.tsx): each place is an icon in a pill with a short label under it.
   The current place takes the pale sky pill with an ink ring. On desktop the
   tiles stack in a narrow rail; on a phone the same tiles line up in a bottom
   bar, so the two cannot drift. Groups are separated by a hairline. */

function NavTile({ item, active, wide }: { item: NavItem; active: boolean; wide?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label === item.shortLabel ? undefined : item.label}
      aria-current={active ? "page" : undefined}
      className={`rail-tile group flex shrink-0 flex-col items-center gap-1 rounded-[10px] px-0.5 pb-2 pt-1.5 text-center text-[11.5px] leading-tight transition-colors ${
        wide ? "w-[68px]" : "w-full"
      } ${active ? "font-bold text-ink" : "font-medium text-ink-muted"}`}
    >
      <span
        className={`rail-pill flex h-8 w-[52px] shrink-0 items-center justify-center rounded-full ${
          active ? "rail-pill-active" : ""
        }`}
      >
        <Icon size={19} />
      </span>
      <span className="max-w-full">{item.shortLabel}</span>
    </Link>
  );
}

function useNavGroups() {
  const { mode } = useNavMode();
  return mode === "author" ? AUTHOR_NAV : OPERATOR_NAV;
}

/** Desktop: the narrow, labeled rail. */
export function SideRail() {
  const pathname = usePathname();
  const groups = useNavGroups();
  return (
    <nav
      aria-label="Main navigation"
      className="side-rail hidden w-[88px] shrink-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain border-r border-line bg-surface px-1.5 py-4 md:flex"
    >
      {groups.map((group, index) => (
        <div
          key={group[0].href}
          className={`flex flex-col gap-1 ${index > 0 ? "mt-2 border-t border-line pt-2" : ""}`}
        >
          {group.map((item) => (
            <NavTile key={item.href} item={item} active={isNavItemActive(pathname, item.href)} />
          ))}
        </div>
      ))}
    </nav>
  );
}

/** Phone: the same tiles in a bottom bar. Scrolls sideways when a mode has
 *  more places than fit; a hairline still marks each group. */
export function PhoneBar() {
  const pathname = usePathname();
  const groups = useNavGroups();
  return (
    <nav
      aria-label="Main navigation"
      className="phone-bar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] pt-1.5 md:hidden"
    >
      <div className="flex overflow-x-auto px-1.5">
        {groups.map((group, index) => (
          <div
            key={group[0].href}
            className={`flex shrink-0 gap-0.5 ${index > 0 ? "ml-1 border-l border-line pl-1" : ""}`}
          >
            {group.map((item) => (
              <NavTile
                key={item.href}
                item={item}
                active={isNavItemActive(pathname, item.href)}
                wide
              />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
