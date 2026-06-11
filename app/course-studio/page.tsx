import { EmptyState } from "@/components/empty-state";
import { IconStudio } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

export default function CourseStudioPage() {
  return (
    <>
      <PageHeader
        title="Course Studio"
        description="A no-code studio for creating and editing MLRI course templates."
        actions={<StatusBadge tone="neutral">Coming soon</StatusBadge>}
      />
      <EmptyState icon={<IconStudio size={28} />} title="Course Studio is a later milestone">
        <p>Planned for after the read-only foundation is stable:</p>
        <ul className="mt-2 list-inside list-disc text-left">
          <li>A template library for the LACE course package (HTML, CSS, nav, config)</li>
          <li>A WYSIWYG editor that exposes safe content fields only — never course-nav.js or shared wrapper code</li>
          <li>An auto-linker that appends ?d2l_body_type=3 to every generated Brightspace link</li>
        </ul>
      </EmptyState>
    </>
  );
}
