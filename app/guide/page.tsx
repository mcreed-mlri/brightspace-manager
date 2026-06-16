import { EmptyState } from "@/components/empty-state";
import { IconFile } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

/* Placeholder — a plain-English help page for the attorney/legal-aid authors.
   No data; describes the intent so the team can see where it's headed. */
export default function GuidePage() {
  return (
    <div className="max-w-[820px]">
      <PageHeader
        eyebrow="Author · Guide"
        title="How to build a course"
        description="A plain-English walkthrough of the Studio, written for attorneys and legal-aid staff. No technical background needed."
        actions={<StatusBadge tone="neutral">Coming soon</StatusBadge>}
      />
      <EmptyState icon={<IconFile size={28} />} title="Step-by-step guidance, coming soon">
        <p>What this page will cover:</p>
        <ul className="mt-2 list-inside list-disc text-left">
          <li>Starting a draft and naming your course</li>
          <li>Writing each section in plain English: scenario, rule, try-it, takeaways</li>
          <li>Adding interactive blocks (callouts, accordions, timelines)</li>
          <li>Previewing exactly what learners will see</li>
          <li>Exporting a Brightspace-ready package</li>
        </ul>
        <p className="mt-2">
          Complements the &ldquo;Using the Brightspace Manager&rdquo; course already in progress.
        </p>
      </EmptyState>
    </div>
  );
}
