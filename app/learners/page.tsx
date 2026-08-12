import { PageHeader } from "@/components/page-header";
import { MockDataBanner } from "@/components/mock-data-banner";
import { getLearnerProgress } from "@/lib/data/learners";
import { LearnerRoster } from "@/components/learners/learner-roster";

export const dynamic = "force-dynamic";

function MetricCell({
  label,
  value,
  sub,
  lead = false,
}: {
  label: string;
  value: number | string;
  sub: string;
  lead?: boolean;
}) {
  return (
    <div className="bg-surface px-[22px] py-5">
      <span
        className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.07em] ${
          lead ? "text-accent" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
      <div className="mt-3 font-display text-[44px] font-bold leading-none tracking-[-0.03em] text-ink">
        {value}
      </div>
      <div className="mt-[7px] text-[11.5px] leading-snug text-ink-soft">{sub}</div>
    </div>
  );
}

export default async function LearnersPage() {
  const result = await getLearnerProgress();
  const report = result.data;
  const isMock = result.source === "mock";

  return (
    <div className="max-w-[880px] fade-up">
      <PageHeader
        eyebrow="LACE · Learners"
        title="Learner Progress"
        description="How everyone enrolled in LACE courses is doing: completion and recent activity across the platform."
      />

      {isMock ? <MockDataBanner /> : null}

      {/* Metric band */}
      <div className="mb-[30px] grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        <MetricCell
          lead
          label="Learners"
          value={report.totalLearners}
          sub="Enrolled across all courses"
        />
        <MetricCell label="Active" value={report.activeLearners} sub="Active in last 30 days" />
        <MetricCell
          label="Courses"
          value={report.coursesWithEnrollment}
          sub="With at least one learner"
        />
        <MetricCell
          label="Completion"
          value={`${report.overallCompletionPct}%`}
          sub="Enrollment-weighted average"
        />
      </div>

      {/* Outcome band — efficiency + perception metrics, per
          docs/planning/metrics-framework.md */}
      <div className="mb-[30px] grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        <MetricCell
          label="Days to finish"
          value={report.medianDaysToComplete ?? "—"}
          sub="Median, enrollment to completion"
        />
        <MetricCell
          label="Done in 30d"
          value={report.pctCompletedWithin30d !== null ? `${report.pctCompletedWithin30d}%` : "—"}
          sub="Completed within 30 days of enrolling"
        />
        <MetricCell
          label="Usefulness"
          value={report.survey.avgUsefulness !== null ? `${report.survey.avgUsefulness}/5` : "—"}
          sub={
            report.survey.responseRatePct !== null
              ? `${report.survey.responses} ratings · ${report.survey.responseRatePct}% of completers`
              : "No ratings yet"
          }
        />
        <MetricCell
          label="Need help"
          value={report.abandonment.needHelp}
          sub="Stalled learners asking for support"
        />
      </div>

      {/* Why learners stall — reasons from the hub's stalled-course nudge.
          The signal completion rates can't show. */}
      <div className="mb-3">
        <span className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">
          Why learners stall
        </span>
      </div>
      <div className="mb-[30px] overflow-hidden rounded-2xl border border-line bg-surface">
        {(
          [
            {
              label: "Too busy right now",
              count: report.abandonment.tooBusy,
              hint: "Timing problem, not a content problem",
            },
            {
              label: "Course runs too long",
              count: report.abandonment.tooLong,
              hint: "Candidate for chunking or a shorter format",
            },
            {
              label: "Not relevant to my work",
              count: report.abandonment.notRelevant,
              hint: "Targeting or catalog description problem",
            },
            {
              label: "Needs help",
              count: report.abandonment.needHelp,
              hint: "Follow up personally — these learners are waiting on a human",
            },
          ] as const
        ).map((reason) => (
          <div
            key={reason.label}
            className="flex items-center gap-3.5 border-b border-line-soft px-[18px] py-3.5 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{reason.label}</p>
              <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">{reason.hint}</p>
            </div>
            <span className="shrink-0 font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
              {reason.count}
            </span>
          </div>
        ))}
      </div>

      <LearnerRoster
        byCourse={report.byCourse}
        learners={report.learners}
        enrollments={report.enrollments}
      />
    </div>
  );
}
