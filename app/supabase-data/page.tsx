import { DataBrowser, type BrowserTable } from "@/components/supabase/data-browser";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listLearningItems } from "@/lib/data/learning-items";
import { mockJurisdictions, mockPrograms, mockTags } from "@/lib/fixtures/supabase-tables";

export const dynamic = "force-dynamic";

export default async function SupabaseDataPage() {
  const items = await listLearningItems();

  const tables: BrowserTable[] = [
    {
      key: "learning_items",
      label: "learning_items",
      description:
        "The course catalog cache synced from Brightspace. Rows are keyed on provider_course_id (the Brightspace org unit ID).",
      columns: ["title", "item_type", "provider_course_id", "practice_area", "synced_at"],
      rows: items.data as unknown as Record<string, unknown>[],
      source: items.source,
    },
    {
      key: "jurisdictions",
      label: "jurisdictions",
      description:
        "Planned reference table for which states LACE serves. Mock preview of the intended shape until the live table exists.",
      columns: ["code", "name", "active", "course_count"],
      rows: mockJurisdictions,
      source: "mock",
    },
    {
      key: "programs",
      label: "programs",
      description:
        "Planned reference table for program and practice-area categories used across the catalog. Mock preview.",
      columns: ["name", "practice_area", "course_count"],
      rows: mockPrograms,
      source: "mock",
    },
    {
      key: "tags",
      label: "tags",
      description:
        "Planned reference table for catalog tags and how often each is used. Mock preview.",
      columns: ["name", "usage_count"],
      rows: mockTags,
      source: "mock",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Infrastructure · Supabase"
        title="Supabase Data"
        description="Read-only inspector for the Supabase cache layer. Search, sort, open a row for full detail, or export the current view to CSV."
        actions={<StatusBadge tone="info">Read-only</StatusBadge>}
      />
      {items.source === "mock" ? <MockDataBanner /> : null}
      <DataBrowser tables={tables} />
      <p className="mt-6 text-xs text-ink-soft">
        No destructive SQL runs from this UI, ever. Writes to Supabase happen only through the
        logged sync pipeline in a later milestone.
      </p>
    </>
  );
}
