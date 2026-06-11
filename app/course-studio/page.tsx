import Link from "next/link";
import { NewCourseButton } from "@/components/studio/new-course-button";
import { EmptyState } from "@/components/empty-state";
import { IconStudio } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listDrafts } from "@/lib/studio/drafts";
import { getTemplateInfo } from "@/lib/studio/template";
import { formatBytes, formatRelative } from "@/components/courses/course-presentation";

export const dynamic = "force-dynamic";

export default async function CourseStudioPage() {
  const [template, drafts] = await Promise.all([getTemplateInfo(), listDrafts()]);

  return (
    <>
      <PageHeader
        title="Course Studio"
        description="Build LACE courses without touching wrapper code. Drafts are the source of truth; the HTML package is generated from your template on export."
        actions={<NewCourseButton />}
      />

      <section className="mb-8">
        <h2 className="section-title mb-3 text-ink">Wrapper template</h2>
        <div className="editorial-card px-5 py-4">
          {template.available ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="ok">found</StatusBadge>
                <code className="font-mono text-xs text-ink-soft">{template.dir}</code>
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {template.files.map((file) => (
                  <li key={file.name} className="flex items-center gap-3 text-sm">
                    <code className="font-mono text-xs text-ink">{file.name}</code>
                    <span className="ml-auto font-mono text-[11px] text-ink-soft">
                      {formatBytes(file.sizeBytes)} · {formatRelative(file.modifiedAt)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-soft">
                Exports always use the latest version of these files — update the template repo and
                every future export picks it up.
              </p>
            </>
          ) : (
            <>
              <StatusBadge tone="error">not found</StatusBadge>
              <p className="mt-2 text-sm text-ink-muted">
                Expected the wrapper template at{" "}
                <code className="font-mono text-xs">{template.dir}</code>. Set{" "}
                <code className="font-mono text-xs">COURSE_TEMPLATE_DIR</code> in{" "}
                <code className="font-mono text-xs">.env</code> if it lives elsewhere.
              </p>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3 text-ink">Course drafts</h2>
        {drafts.length === 0 ? (
          <EmptyState icon={<IconStudio size={28} />} title="No drafts yet">
            <p>
              Create your first course — a guided form for the five-section LACE topic structure,
              with live preview and one-click package export.
            </p>
          </EmptyState>
        ) : (
          <div className="editorial-card divide-y divide-line-soft">
            {drafts.map((draft) => (
              <Link
                key={draft.id}
                href={`/course-studio/${draft.id}/`}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-hover-tint"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{draft.courseTitle}</p>
                  <p className="font-mono text-xs text-ink-soft">
                    {draft.topicCount} topic{draft.topicCount === 1 ? "" : "s"} ·{" "}
                    {draft.totalMinutes} min · edited {formatRelative(draft.updatedAt)}
                  </p>
                </div>
                <span className="ml-auto text-xs font-medium text-brand">Open →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
