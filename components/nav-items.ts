import type { ComponentType } from "react";
import {
  IconBlocks,
  IconBook,
  IconChart,
  IconCourses,
  IconDashboard,
  IconDatabase,
  IconFaculty,
  IconFiles,
  IconLearners,
  IconList,
  IconMap,
  IconSettings,
  IconShield,
  IconStudio,
  IconSync,
  IconTrend,
  IconUpload,
} from "@/components/icons";

/* The places in each mode, drawn as tiles by the rail (desktop) and the
   bottom bar (phone). Groups are separated by a hairline, as in the Training
   Hub's rail. `shortLabel` is what fits under the icon in an 88px rail; the
   full label is the tile's tooltip. */

export type NavMode = "author" | "operator";

export type NavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: ComponentType<{ size?: number }>;
};

export const OPERATOR_NAV: NavItem[][] = [
  [{ label: "Dashboard", shortLabel: "Dashboard", href: "/dashboard/", icon: IconDashboard }],
  [
    { label: "Course Inventory", shortLabel: "Courses", href: "/courses/", icon: IconCourses },
    { label: "Sync Diagnostics", shortLabel: "Sync", href: "/sync/", icon: IconSync },
    { label: "Integrity Checker", shortLabel: "Integrity", href: "/integrity/", icon: IconShield },
    { label: "Evaluation", shortLabel: "Evaluation", href: "/evaluation/", icon: IconChart },
    { label: "Learner Progress", shortLabel: "Learners", href: "/learners/", icon: IconLearners },
  ],
  [
    { label: "Brightspace Files", shortLabel: "Files", href: "/files/", icon: IconFiles },
    { label: "Supabase Data", shortLabel: "Data", href: "/supabase-data/", icon: IconDatabase },
    { label: "Settings", shortLabel: "Settings", href: "/settings/", icon: IconSettings },
  ],
];

export const AUTHOR_NAV: NavItem[][] = [
  [
    { label: "Course Studio", shortLabel: "Studio", href: "/course-studio/", icon: IconStudio },
    { label: "Curriculum Map", shortLabel: "Curriculum", href: "/curriculum-map/", icon: IconMap },
  ],
  [
    { label: "How to build a course", shortLabel: "Guide", href: "/guide/", icon: IconBook },
    {
      label: "Building blocks",
      shortLabel: "Blocks",
      href: "/building-blocks/",
      icon: IconBlocks,
    },
    { label: "Publish workflow", shortLabel: "Publish", href: "/publish/", icon: IconUpload },
    {
      label: "Learning Hub listing",
      shortLabel: "Hub listing",
      href: "/hub-listing/",
      icon: IconList,
    },
  ],
  [
    { label: "Faculty", shortLabel: "Faculty", href: "/faculty/", icon: IconFaculty },
    {
      label: "How my courses are doing",
      shortLabel: "My courses",
      href: "/my-courses/",
      icon: IconTrend,
    },
  ],
];

function firstSegments(groups: NavItem[][]) {
  return new Set(groups.flat().map((item) => item.href.split("/").filter(Boolean)[0]));
}

const OPERATOR_ROUTES = firstSegments(OPERATOR_NAV);
const AUTHOR_ROUTES = firstSegments(AUTHOR_NAV);

export function routeMode(pathname: string): NavMode | null {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (OPERATOR_ROUTES.has(segment)) return "operator";
  if (AUTHOR_ROUTES.has(segment)) return "author";
  return null;
}

export function isNavItemActive(pathname: string, href: string) {
  return pathname.replace(/\/$/, "") === href.slice(0, -1) || pathname.startsWith(href);
}
