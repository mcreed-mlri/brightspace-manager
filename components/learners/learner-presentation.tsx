import type { BadgeTone } from "@/components/status-badge";
import type { CourseProgress, LearnerRole, LearnerStatus } from "@/types/domain";

export const STATUS_TONE: Record<LearnerStatus, BadgeTone> = {
  completed: "ok",
  "in-progress": "info",
  "not-started": "neutral",
};

export const STATUS_LABEL: Record<LearnerStatus, string> = {
  completed: "done",
  "in-progress": "in progress",
  "not-started": "not started",
};

export const ROLE_LABEL: Record<LearnerRole, string> = {
  attorney: "Attorney",
  advocate: "Advocate",
  paralegal: "Paralegal",
  support: "Support",
};

/* Stacked completion bar — completed / in progress / not started, sized by
   share of enrollment. */
export function ProgressBar({ course }: { course: CourseProgress }) {
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
