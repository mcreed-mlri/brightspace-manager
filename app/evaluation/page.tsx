import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import { getEvaluationReport } from "@/lib/data/evaluation";
import type {
  EvaluationCourseSignal,
  EvaluationMetricReadiness,
  EvaluationSegment,
  EvaluationTrendPoint,
} from "@/types/domain";

export const dynamic = "force-dynamic";

const RISK_TONE: Record<EvaluationCourseSignal["risk"], BadgeTone> = {
  healthy: "ok",
  watch: "warn",
  intervene: "error",
};

const READINESS_TONE: Record<EvaluationMetricReadiness["status"], BadgeTone> = {
  ready: "ok",
  partial: "warn",
  planned: "neutral",
};

function TrendChart({ points }: { points: EvaluationTrendPoint[] }) {
  const maxReach = Math.max(...points.map((p) => p.reach));

  return (
    <section className="editorial-card px-5 py-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title text-ink">Pilot trend</h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Reach, completion, usefulness, and confidence are the framework spine.
          </p>
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-ink-soft">
          monthly
        </span>
      </div>

      <div className="grid min-h-[270px] grid-cols-6 items-end gap-3 border-b border-line-soft pb-3">
        {points.map((point) => (
          <div key={point.month} className="flex min-w-0 flex-col items-center gap-2">
            <div className="flex h-[210px] w-full max-w-[58px] items-end justify-center gap-1.5">
              <span
                className="w-[22%] rounded-t-sm bg-[var(--cat-blue)]"
                style={{ height: `${(point.reach / maxReach) * 100}%` }}
                title={`Reach: ${point.reach}`}
              />
              <span
                className="w-[22%] rounded-t-sm bg-[var(--cat-green)]"
                style={{ height: `${point.completion}%` }}
                title={`Completion: ${point.completion}%`}
              />
              <span
                className="w-[22%] rounded-t-sm bg-[var(--cat-amber)]"
                style={{ height: `${(point.usefulness / 5) * 100}%` }}
                title={`Usefulness: ${point.usefulness}/5`}
              />
              <span
                className="w-[22%] rounded-t-sm bg-[var(--cat-pink)]"
                style={{ height: `${(point.confidenceDelta / 1.5) * 100}%` }}
                title={`Confidence delta: +${point.confidenceDelta}`}
              />
            </div>
            <span className="font-mono text-[11px] text-ink-soft">{point.month}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-soft">
        <Legend color="var(--cat-blue)" label="reach" />
        <Legend color="var(--cat-green)" label="completion" />
        <Legend color="var(--cat-amber)" label="useful" />
        <Legend color="var(--cat-pink)" label="confidence" />
      </div>
    </section>
  );
}

function SegmentPanel({ segments }: { segments: EvaluationSegment[] }) {
  return (
    <section className="editorial-card px-5 py-5">
      <h2 className="section-title text-ink">Equity by role</h2>
      <p className="mt-1 text-[12.5px] text-ink-muted">
        The framework keeps averages honest by segmenting role groups.
      </p>
      <div className="mt-5 space-y-4">
        {segments.map((segment) => (
          <div key={segment.role}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">{segment.role}</span>
              <span className="font-mono text-[11px] text-ink-soft">
                {segment.learners} learners - {segment.usefulness}/5 - +{segment.confidenceDelta}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
              <span
                className="block h-full rounded-full bg-[var(--cat-teal)]"
                style={{ width: `${segment.completionPct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CourseSignalPanel({ courses }: { courses: EvaluationCourseSignal[] }) {
  return (
    <section className="editorial-card px-5 py-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-ink">Course effectiveness signals</h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Completion and usefulness together show where to invest.
          </p>
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-ink-soft">
          mock rollup
        </span>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.courseName}
            href={`/learners?course=${course.orgUnitId}`}
            className="block rounded-lg border border-line-soft bg-surface px-4 py-3 transition-colors hover:bg-hover-tint"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{course.courseName}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                  {course.reach} reached - {course.medianDaysToComplete}d median - {course.usefulness}/5
                </p>
              </div>
              <StatusBadge tone={RISK_TONE[course.risk]}>{course.risk}</StatusBadge>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                <span
                  className="block h-full rounded-full bg-[var(--cat-green)]"
                  style={{ width: `${course.completionPct}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-[11px] text-ink-soft">
                {course.completionPct}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ReadinessTable({ rows }: { rows: EvaluationMetricReadiness[] }) {
  return (
    <section className="editorial-card overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h2 className="section-title text-ink">Metric readiness</h2>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          What is demonstrable now versus what needs live instrumentation.
        </p>
      </div>
      <div className="divide-y divide-line-soft">
        {rows.map((row) => (
          <div key={row.metric} className="grid gap-2 px-5 py-4 md:grid-cols-[1.1fr_0.9fr_auto_1.4fr] md:items-center">
            <p className="text-sm font-semibold text-ink">{row.metric}</p>
            <p className="font-mono text-[11px] text-ink-soft">{row.source}</p>
            <StatusBadge tone={READINESS_TONE[row.status]}>{row.status}</StatusBadge>
            <p className="text-[12.5px] leading-snug text-ink-muted">{row.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-[2px]" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

export default async function EvaluationPage() {
  const result = await getEvaluationReport();
  const report = result.data;
  const isMock = result.source === "mock";

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Operator / Evaluation"
        title="Evaluation Framework"
        description={report.thesis}
      />

      {isMock ? <MockDataBanner /> : null}

      <section className="mb-6 rounded-[14px] border border-[var(--accent-tint)] bg-brand-tint px-5 py-4">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-accent-ink">
          {report.pilotWindow}
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          This mock readout demonstrates the metrics framework before live Brightspace progress,
          hub feedback, and survey rollups are connected.
        </p>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {report.kpis.map((kpi) => (
          <MetricCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            sub={kpi.sub}
            badge={
              <span className="font-mono text-[11px] text-ink-soft">
                {kpi.trend === "up" ? "up" : kpi.trend === "down" ? "down" : "steady"}
              </span>
            }
          />
        ))}
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <TrendChart points={report.trend} />
        <SegmentPanel segments={report.segments} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <CourseSignalPanel courses={report.courseSignals} />
        <ReadinessTable rows={report.readiness} />
      </div>
    </div>
  );
}
