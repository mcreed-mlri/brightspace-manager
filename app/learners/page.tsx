import { PageHeader } from "@/components/page-header";
import { MockDataBanner } from "@/components/mock-data-banner";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import { getLearnerProgress } from "@/lib/data/learners";
import { formatRelative } from "@/components/courses/course-presentation";
import type { CourseProgress, LearnerStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<LearnerStatus, BadgeTone> = {
  completed: "ok",
  "in-progress": "info",
  "not-started": "neutral",
};

const STATUS_LABEL: Record<LearnerStatus, string> = {
  completed: "done",
  "in-progress": "in progress",
  "not-started": "not started",
};

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

/* Stacked completion bar — completed / in progress / not started, sized by
   share of enrollment. */
function ProgressBar({ course }: { course: CourseProgress }) {
  const total = Math.max(course.enrolled, 1);
  const segments = [
    { value: course.completed, color: "var(--ok)" },
    { value: course.inProgress, color: "var(--accent)" },
    { value: course.notStarted, color: "var(--surface-sunken)" },
  ];
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-surface-sunken" aria-hidden>
      {segments.map((seg, index) => (
        <span
          key={index}
          style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
        />
      ))}
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

      {/* By course */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">
          By course
        </span>
        <span className="flex items-center gap-3.5 font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-soft">
          <LegendDot color="var(--ok)" label="done" />
          <LegendDot color="var(--accent)" label="in progress" />
          <LegendDot color="var(--surface-sunken)" label="not started" />
        </span>
      </div>
      <div className="mb-[30px] overflow-hidden rounded-2xl border border-line bg-surface">
        {report.byCourse.map((course) => (
          <div key={course.orgUnitId} className="border-b border-line-soft px-[18px] py-4 last:border-b-0">
            <div className="mb-2.5 flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{course.courseName}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                  {course.enrolled} enrolled · {course.completed} done ·{" "}
                  {course.lastActivityAt
                    ? `active ${formatRelative(course.lastActivityAt)}`
                    : "no activity yet"}
                </p>
              </div>
              <span className="shrink-0 font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
                {course.avgCompletionPct}%
              </span>
            </div>
            <ProgressBar course={course} />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mb-3">
        <span className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">
          Recent activity
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {report.recent.map((row) => (
          <div
            key={`${row.email}-${row.courseName}`}
            className="flex items-center gap-3.5 border-b border-line-soft px-[18px] py-3.5 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{row.name}</p>
              <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">{row.courseName}</p>
            </div>
            <span className="hidden shrink-0 font-mono text-[11px] text-ink-soft sm:inline">
              {row.progressPct}%
            </span>
            <span className="shrink-0">
              <StatusBadge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</StatusBadge>
            </span>
            <span className="hidden shrink-0 font-mono text-[11px] text-ink-soft md:inline">
              {formatRelative(row.lastActiveAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}
