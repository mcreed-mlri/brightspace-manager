import { notFound } from "next/navigation";
import Link from "next/link";
import { Builder } from "@/components/studio/builder";
import { StatusBadge } from "@/components/status-badge";
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

  return (
    <>
      <div className="grid min-h-screen place-items-center bg-paper px-4 py-8 md:hidden">
        <section className="editorial-card max-w-[420px] border-[var(--amber-tint)] bg-status-warn-soft px-5 py-5">
          <StatusBadge tone="warn">Desktop required</StatusBadge>
          <h1 className="mt-3 font-display text-[24px] font-bold leading-tight text-ink">
            Course editing needs the desktop Studio.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            The builder uses an outline, editor, and learner preview side by side. On a
            phone, use Brightspace Manager for quick checks instead.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/courses/" className="btn-secondary">
              Check course inventory
            </Link>
            <Link href="/course-studio/" className="btn-secondary">
              Back to Studio
            </Link>
          </div>
        </section>
      </div>
      <div className="hidden h-full md:block">
        <Builder initialDraft={draft} openDetailsInitially={details === "1"} />
      </div>
    </>
  );
}
