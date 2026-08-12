"use client";

import { Drawer } from "@/components/drawer";
import { StatusBadge } from "@/components/status-badge";
import { formatRelative } from "@/components/courses/course-presentation";
import { ROLE_LABEL, STATUS_TONE, STATUS_LABEL } from "@/components/learners/learner-presentation";
import type { LearnerActivity, LearnerRecord } from "@/types/domain";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-line-soft py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

export function LearnerDrawer({
  learner,
  enrollments,
  onClose,
}: {
  learner: LearnerRecord | null;
  enrollments: LearnerActivity[];
  onClose: () => void;
}) {
  if (!learner) return null;

  return (
    <Drawer open title={learner.name} onClose={onClose}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge tone="neutral">{ROLE_LABEL[learner.role]}</StatusBadge>
      </div>

      <dl>
        <Field label="Email" value={learner.email} />
        <Field label="Jurisdiction" value={learner.jurisdiction} />
      </dl>

      <div className="mt-5">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-soft">
          Enrolled courses
        </span>
        <div className="mt-2 overflow-hidden rounded-xl border border-line-soft">
          {enrollments.length === 0 ? (
            <p className="px-3.5 py-3 text-sm text-ink-soft">Not enrolled in any courses.</p>
          ) : (
            enrollments.map((row) => (
              <div
                key={row.orgUnitId}
                className="border-b border-line-soft px-3.5 py-2.5 last:border-b-0"
              >
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium text-ink">{row.courseName}</p>
                  <StatusBadge tone={STATUS_TONE[row.status]}>
                    {STATUS_LABEL[row.status]}
                  </StatusBadge>
                </div>
                <p className="font-mono text-[11px] text-ink-soft">
                  {row.progressPct}% · active {formatRelative(row.lastActiveAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Drawer>
  );
}
