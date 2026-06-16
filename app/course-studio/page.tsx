import Link from "next/link";
import { CourseList } from "@/components/studio/course-list";
import { NewCourseButton } from "@/components/studio/new-course-button";
import { StatusBadge } from "@/components/status-badge";
import { listDrafts } from "@/lib/studio/drafts";
import { getTemplateInfo } from "@/lib/studio/template";
import { formatBytes } from "@/components/courses/course-presentation";

export const dynamic = "force-dynamic";

export default async function CourseStudioPage() {
  const [template, drafts] = await Promise.all([getTemplateInfo(), listDrafts()]);
  const lastDraft = drafts[0];

  return (
    <div className="max-w-[820px]">
      <header className="mb-[22px]">
        <h1 className="page-title text-ink">Course Studio</h1>
        <p className="mt-[5px] max-w-[680px] text-sm leading-[1.55] text-ink-muted">
          Build Brightspace-ready courses from our shared template. Course Studio
          walks you through each step. Write in plain English, export when you&apos;re
          done.
        </p>
      </header>

      <section className="mb-[30px] rounded-[14px] border border-[var(--accent-tint)] bg-brand-tint px-[30px] py-[26px]">
        <p className="eyebrow mb-2.5">Course Studio</p>
        <h2 className="mb-[18px] font-display text-[24px] font-bold tracking-[-0.025em] text-ink">
          Start a draft
        </h2>
        <div className="flex items-center gap-[9px]">
          <NewCourseButton label="+ New course" />
          {lastDraft ? (
            <Link href={`/course-studio/${lastDraft.id}/`} className="btn-secondary">
              Continue draft
            </Link>
          ) : null}
        </div>
      </section>

      <p className="section-title mb-2 text-ink">Your courses</p>
      <div className="editorial-card mb-[22px]">
        <CourseList drafts={drafts} />
      </div>

      <p className="section-title mb-2 text-ink">Course template source</p>
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
              Every course you build pulls from this template automatically, so the look and
              feel stay consistent across all your courses.
            </p>
          </>
        ) : (
          <>
            <StatusBadge tone="error">not found</StatusBadge>
            <p className="mt-2 text-sm text-ink-muted">
              Expected the course template at{" "}
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
