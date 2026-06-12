import Link from "next/link";
import { NewCourseButton } from "@/components/studio/new-course-button";
import { StatusBadge } from "@/components/status-badge";
import { listDrafts } from "@/lib/studio/drafts";
import { formatRelative } from "@/components/courses/course-presentation";

export const dynamic = "force-dynamic";

/* Author Home (design handoff v3) — the plain-English landing screen for
   attorneys and legal aid staff. Reads only; nothing here changes anything
   until they choose to publish from the Studio. */

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, counsel.";
  if (hour < 17) return "Good afternoon, counsel.";
  return "Good evening, counsel.";
}

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
        <p className="mb-[5px] font-mono text-[11px] text-ink-soft">{dateLine()}</p>
        <h1 className="page-title text-ink">{greeting()}</h1>
        <p className="mt-[5px] max-w-[680px] text-sm leading-[1.55] text-ink-muted">
          Your courses on the LACE Learning Hub, in plain language. Everything here is safe to
          read — nothing changes until you choose to publish.
        </p>
      </header>

      <section className="mb-[30px] rounded-[14px] border border-[rgba(42,91,255,0.16)] bg-brand-tint px-[30px] py-[26px]">
        <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand">
          Course Studio
        </p>
        <h2 className="mb-1.5 text-xl font-extrabold tracking-[-0.025em] text-ink">
          Build a course without touching any code.
        </h2>
        <p className="mb-[18px] max-w-[480px] text-[13.5px] leading-relaxed text-ink-muted">
          Fill in a few plain-English boxes — a scenario, a rule, a question — and watch the
          finished course build itself on the right.
        </p>
        <div className="flex items-center gap-[9px]">
          <NewCourseButton label="+ Start a new course" />
          {lastDraft ? (
            <Link href={`/course-studio/${lastDraft.id}/`} className="btn-secondary">
              Continue last draft
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
          <p className="px-5 py-5 text-[13px] text-ink-muted">
            No courses yet — start your first one above. It stays a private draft until you
            publish it.
          </p>
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
        <span className="section-title text-ink">Who could use a nudge</span>
        <Link href="/learners/" className="text-[12.5px] font-semibold text-brand">
          See everyone →
        </Link>
      </div>
      <div className="editorial-card px-5 py-5">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Learner progress is on its way — once courses report progress to Supabase, the people
          who are stuck or haven&apos;t started will show up here so you know who to check in
          with.
        </p>
      </div>
    </div>
  );
}
