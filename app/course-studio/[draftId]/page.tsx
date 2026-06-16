import { notFound } from "next/navigation";
import { Builder } from "@/components/studio/builder";
import { readDraft } from "@/lib/studio/drafts";

export const dynamic = "force-dynamic";

/* Full-screen builder — the AppShell hides the sidebar and removes page
   padding on this route; the Builder owns the whole viewport. */
export default async function CourseBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ draftId: string }>;
  searchParams: Promise<{ details?: string }>;
}) {
  const { draftId } = await params;
  const { details } = await searchParams;
  const draft = await readDraft(draftId);
  if (!draft) notFound();

  return <Builder initialDraft={draft} openDetailsInitially={details === "1"} />;
}
