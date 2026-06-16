import Link from "next/link";
import { NewCourseButton } from "@/components/studio/new-course-button";
import { StatusBadge } from "@/components/status-badge";
import { listDrafts } from "@/lib/studio/drafts";
import { formatRelative } from "@/components/courses/course-presentation";

export const dynamic = "force-dynamic";

/* Author Home (design handoff v3) — the plain-English landing screen for
   attorneys and legal aid staff. Reads only; nothing here changes anything
   until they choose to publish from the Studio. */

function dateLine(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AuthorHomePage() {
  const drafts = await listDrafts();
  const lastDraft = drafts[0];

  return (
    <div className="max-w-[820px]">
      <header className="mb-[26px]">
        <p className="font-mono text-[11px] text-ink-soft">{dateLine()}</p>
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

      <div className="mb-2.5 flex items-center justify-between">
        <span className="section-title text-ink">Your courses</span>
        <Link href="/course-studio/" className="text-[12.5px] font-semibold text-brand">
          All courses →
        </Link>
      </div>
      <div className="editorial-card mb-[26px]">
        {drafts.length === 0 ? (
          <p className="px-5 py-5 text-[13px] text-ink-muted">No drafts yet.</p>
        ) : (
          drafts.slice(0, 5).map((draft) => (
            <Link
              key={draft.id}
              href={`/course-studio/${draft.id}/`}
              className="flex items-center gap-[13px] border-b border-line-soft px-5 py-[13px] transition-colors last:border-b-0 hover:bg-hover"
            >
              <svg
                className="shrink-0 text-ink-soft"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                <path d="M2 2h10v10H2z" />
                <path d="M5 6h4M5 8.5h2.5" />
              </svg>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">
                  {draft.courseTitle}
                </span>
                <span className="block text-xs text-ink-soft">
                  {draft.topicCount} lesson{draft.topicCount === 1 ? "" : "s"} ·{" "}
                  {draft.totalMinutes} min · edited {formatRelative(draft.updatedAt)}
                </span>
              </span>
              <StatusBadge tone="neutral">draft</StatusBadge>
              <svg
                className="shrink-0 text-ink-soft"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path d="M4 7h6M7.5 4l3 3-3 3" />
              </svg>
            </Link>
          ))
        )}
      </div>

      <div className="mb-2.5 flex items-center justify-between">
        <span className="section-title text-ink">Learner progress</span>
        <Link href="/learners/" className="text-[12.5px] font-semibold text-brand">
          See everyone →
        </Link>
      </div>
      <div className="editorial-card px-5 py-5">
        <p className="text-[13px] text-ink-muted">Not available yet.</p>
      </div>
    </div>
  );
}
