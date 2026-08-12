import { EmptyState } from "@/components/empty-state";
import { IconShield } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

export default function IntegrityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Monitor · Integrity"
        title="Integrity Checker"
        description="Cross-checks Brightspace Content, Manage Files, HTML links, and Supabase records to catch ghost topics and broken content."
        actions={<StatusBadge tone="neutral">Coming soon</StatusBadge>}
      />
      <EmptyState
        icon={<IconShield size={28} />}
        title="The Integrity Checker is a later milestone"
      >
        <p>Planned checks:</p>
        <ul className="mt-2 list-inside list-disc text-left">
          <li>Content topics whose linked HTML file is missing (ghost topics)</li>
          <li>Orphaned files no Content topic links to</li>
          <li>Broken internal links, missing images, and missing ?d2l_body_type=3 parameters</li>
          <li>Supabase records pointing at archived or missing Brightspace content</li>
        </ul>
        <p className="mt-2">
          Cleanup follows MLRI governance: <strong>archive, do not delete</strong>. Every action
          previews first, requires confirmation, and is logged.
        </p>
      </EmptyState>
    </>
  );
}
