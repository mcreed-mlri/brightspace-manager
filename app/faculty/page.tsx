import { EmptyState } from "@/components/empty-state";
import { IconLearners } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

/* Placeholder — course authorship/provenance. Activates once drafts record a
   creator (planned with the Drafts → Supabase migration) and more than one
   person is authoring. No data today. */
export default function FacultyPage() {
  return (
    <div className="max-w-[820px]">
      <PageHeader
        eyebrow="Author · Faculty"
        title="Faculty"
        description="Who created and maintains each course. Authorship is stamped when a course is built and travels with the content."
        actions={<StatusBadge tone="neutral">Coming soon</StatusBadge>}
      />
      <EmptyState icon={<IconLearners size={28} />} title="Course authorship, coming soon">
        <p>This page will show:</p>
        <ul className="mt-2 list-inside list-disc text-left">
          <li>Each course with the person who authored it</li>
          <li>Who last edited it, and when</li>
          <li>A per-author view: every course one teammate owns</li>
        </ul>
        <p className="mt-2">
          Part of <strong>owning the content</strong>: provenance lives with the course, not the
          LMS. Activates once drafts record a creator and the team grows past one author.
        </p>
      </EmptyState>
    </div>
  );
}
