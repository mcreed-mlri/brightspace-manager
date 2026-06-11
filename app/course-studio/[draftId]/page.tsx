import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseBuilder } from "@/components/studio/course-builder";
import { PageHeader } from "@/components/page-header";
import { readDraft } from "@/lib/studio/drafts";

export const dynamic = "force-dynamic";

export default async function CourseBuilderPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const draft = await readDraft(draftId);
  if (!draft) notFound();

  return (
    <>
      <PageHeader
        title={draft.courseTitle}
        description="Edit the five-section LACE topic structure. Wrapper code ships from the template — you never touch it."
        actions={
          <Link href="/course-studio/" className="btn-secondary">
            ← All drafts
          </Link>
        }
      />
      <CourseBuilder initialDraft={draft} />
    </>
  );
}
