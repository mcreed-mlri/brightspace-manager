import { EmptyState } from "@/components/empty-state";
import { IconCopy } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

/* Placeholder — a gallery of the sections and interactive elements available
   in the Studio. No data; describes the intent for the team demo. */
export default function BuildingBlocksPage() {
  return (
    <div className="max-w-[820px]">
      <PageHeader
        eyebrow="Author · Building blocks"
        title="Building blocks"
        description="A browsable gallery of every section and interactive element you can drop into a course. See what's available before you start."
        actions={<StatusBadge tone="neutral">Coming soon</StatusBadge>}
      />
      <EmptyState icon={<IconCopy size={28} />} title="The block gallery is coming soon">
        <p>It will showcase the pieces you build a topic from:</p>
        <ul className="mt-2 list-inside list-disc text-left">
          <li>The five teaching sections: scenario, rule, what changed, try-it, takeaways</li>
          <li>Interactive elements: callouts, accordions, reveal cards, timelines, pull quotes</li>
          <li>A live example of each, so you can see it before adding it</li>
        </ul>
        <p className="mt-2">
          Today the template just shows a &ldquo;found&rdquo; status. This turns it into a visual catalog.
        </p>
      </EmptyState>
    </div>
  );
}
