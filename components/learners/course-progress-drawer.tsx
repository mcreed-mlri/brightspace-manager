"use client";

import { Drawer } from "@/components/drawer";
import { StatusBadge } from "@/components/status-badge";
import { formatRelative } from "@/components/courses/course-presentation";
import { ProgressBar, STATUS_TONE, STATUS_LABEL } from "@/components/learners/learner-presentation";
import type { CourseProgress, LearnerActivity } from "@/types/domain";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-line-soft py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

export function CourseProgressDrawer({
  course,
  roster,
  onSelectLearner,
  onClose,
}: {
  course: CourseProgress | null;
  roster: LearnerActivity[];
  onSelectLearner: (learnerId: string) => void;
  onClose: () => void;
}) {
  if (!course) return null;

  return (
    <Drawer open title={course.courseName} onClose={onClose}>
      <div className="mb-4">
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <span className="font-mono text-[11px] text-ink-soft">
            {course.enrolled} enrolled · {course.completed} done
          </span>
          <span className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
            {course.avgCompletionPct}%
          </span>
        </div>
        <ProgressBar course={course} />
      </div>

      <dl>
        <Field
          label="Median days to finish"
          value={course.medianDaysToComplete !== null ? `${course.medianDaysToComplete}d` : "—"}
        />
        <Field
          label="Completed within 30 days"
          value={course.pctCompletedWithin30d !== null ? `${course.pctCompletedWithin30d}%` : "—"}
        />
        <Field
          label="Usefulness"
          value={
            course.survey && course.survey.avgUsefulness !== null
              ? `${course.survey.avgUsefulness}/5 (${course.survey.responses} ratings)`
              : "No ratings yet"
          }
        />
        <Field
          label="Last activity"
          value={course.lastActivityAt ? formatRelative(course.lastActivityAt) : "No activity yet"}
        />
        {course.dropOffModule ? (
          <Field label="Drop-off module" value={course.dropOffModule} />
        ) : null}
      </dl>

      <div className="mt-5">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-soft">
          Enrolled learners
        </span>
        <div className="mt-2 overflow-hidden rounded-xl border border-line-soft">
          {roster.length === 0 ? (
            <p className="px-3.5 py-3 text-sm text-ink-soft">No learners enrolled.</p>
          ) : (
            roster.map((row) => (
              <button
                key={row.learnerId}
                type="button"
                onClick={() => onSelectLearner(row.learnerId)}
                className="flex w-full items-center gap-3 border-b border-line-soft px-3.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-hover-tint"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{row.name}</p>
                  <p className="truncate text-[12px] text-ink-muted">{row.email}</p>
                </div>
                <span className="hidden shrink-0 font-mono text-[11px] text-ink-soft sm:inline">
                  {row.progressPct}%
                </span>
                <StatusBadge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</StatusBadge>
              </button>
            ))
          )}
        </div>
      </div>
    </Drawer>
  );
}
