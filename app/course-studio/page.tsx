import { CourseList } from "@/components/studio/course-list";
import { NewCourseButton } from "@/components/studio/new-course-button";
import { StatusBadge } from "@/components/status-badge";
import { listDrafts } from "@/lib/studio/drafts";
import { getTemplateInfo } from "@/lib/studio/template";
import { formatBytes } from "@/components/courses/course-presentation";

export const dynamic = "force-dynamic";

export default async function CourseStudioPage() {
  const [template, drafts] = await Promise.all([getTemplateInfo(), listDrafts()]);

  return (
    <div className="max-w-[820px]">
      <header className="mb-[22px] flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title text-ink">Course Studio</h1>
          <p className="mt-[5px] max-w-[680px] text-sm leading-[1.55] text-ink-muted">
            Build LACE courses without touching wrapper code. Your words are the source of
            truth — the course package is generated for you on publish.
          </p>
        </div>
        <span className="mt-1 shrink-0">
          <NewCourseButton />
        </span>
      </header>

      <p className="section-title mb-2 text-ink">Your courses</p>
      <div className="editorial-card mb-[22px]">
        <CourseList drafts={drafts} />
      </div>

      <p className="section-title mb-2 text-ink">Wrapper template</p>
      <div className="editorial-card px-5 py-4">
        {template.available ? (
          <>
            <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
              <StatusBadge tone="ok">● found</StatusBadge>
              <code className="font-mono text-xs text-ink-muted">{template.dir}</code>
            </div>
            <div className="mb-2.5 flex flex-wrap gap-x-[18px] gap-y-1.5">
              {template.files.map((file) => (
                <span key={file.name} className="inline-flex items-center gap-[5px] text-xs text-ink-muted">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="opacity-50"
                    aria-hidden
                  >
                    <rect x="2" y="1" width="8" height="10" rx="1" />
                    <path d="M4 5h4M4 7h2.5" />
                  </svg>
                  {file.name}
                  <span className="text-ink-soft">{formatBytes(file.sizeBytes)}</span>
                </span>
              ))}
            </div>
            <p className="text-[12.5px] leading-[1.55] text-ink-soft">
              Every course you build uses the latest version of these files automatically — so
              your wrapper stays consistent even when you&apos;re not here.
            </p>
          </>
        ) : (
          <>
            <StatusBadge tone="error">not found</StatusBadge>
            <p className="mt-2 text-sm text-ink-muted">
              Expected the wrapper template at{" "}
              <code className="font-mono text-xs">{template.dir}</code>. Set{" "}
              <code className="font-mono text-xs">COURSE_TEMPLATE_DIR</code> (local path) or{" "}
              <code className="font-mono text-xs">COURSE_TEMPLATE_URL</code> (GitHub raw, for
              Vercel) in <code className="font-mono text-xs">.env</code> if it lives elsewhere.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
