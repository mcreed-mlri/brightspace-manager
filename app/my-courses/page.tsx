import { EmptyState } from "@/components/empty-state";
import { IconDashboard } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

/* Placeholder — the author-scoped slice of Learner Progress ("how are people
   doing in MY courses"). Needs hub learner data + course authorship. No data
   today. */
export default function MyCoursesPage() {
  return (
    <div className="max-w-[820px]">
      <PageHeader
        eyebrow="Author · My courses"
        title="How my courses are doing"
        description="Completion and engagement for the courses you authored: your slice of the platform's learner progress."
        actions={<StatusBadge tone="neutral">Coming soon</StatusBadge>}
      />
      <EmptyState icon={<IconDashboard size={28} />} title="Your course analytics, coming soon">
        <p>This page will show, just for courses you authored:</p>
        <ul className="mt-2 list-inside list-disc text-left">
          <li>How many learners started and finished</li>
          <li>Average completion per course</li>
          <li>Where learners get stuck, so you know what to revise</li>
        </ul>
        <p className="mt-2">
          The author-scoped view of <strong>Learner Progress</strong>. Draws on hub learner data
          once it&apos;s flowing.
        </p>
      </EmptyState>
    </div>
  );
}
