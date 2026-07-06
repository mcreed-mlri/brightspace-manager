"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { IconSearch } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { formatRelative } from "@/components/courses/course-presentation";
import {
  ProgressBar,
  ROLE_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/components/learners/learner-presentation";
import { CourseProgressDrawer } from "@/components/learners/course-progress-drawer";
import { LearnerDrawer } from "@/components/learners/learner-drawer";
import type { CourseProgress, LearnerActivity, LearnerRecord, LearnerRole, LearnerStatus } from "@/types/domain";

type Selection = { type: "course"; orgUnitId: number } | { type: "learner"; learnerId: string } | null;

const ROLE_OPTIONS: LearnerRole[] = ["attorney", "advocate", "paralegal", "support"];
const STATUS_OPTIONS: LearnerStatus[] = ["completed", "in-progress", "not-started"];

const selectClass =
  "rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/30";

function LearnerRosterInner({
  byCourse,
  learners,
  enrollments,
}: {
  byCourse: CourseProgress[];
  learners: LearnerRecord[];
  enrollments: LearnerActivity[];
}) {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<number | "all">("all");
  const [roleFilter, setRoleFilter] = useState<LearnerRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LearnerStatus | "all">("all");
  const [selection, setSelection] = useState<Selection>(null);

  const learnerById = useMemo(() => new Map(learners.map((l) => [l.id, l])), [learners]);

  useEffect(() => {
    const raw = searchParams.get("course");
    if (!raw) return;
    const orgUnitId = Number(raw);
    if (!byCourse.some((c) => c.orgUnitId === orgUnitId)) return;
    setCourseFilter(orgUnitId);
    setSelection({ type: "course", orgUnitId });
    // Only read once on mount — the query param seeds the initial filter, not
    // an ongoing sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrollments.filter((row) => {
      if (q) {
        const haystack = `${row.name} ${row.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (courseFilter !== "all" && row.orgUnitId !== courseFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (roleFilter !== "all") {
        const learner = learnerById.get(row.learnerId);
        if (!learner || learner.role !== roleFilter) return false;
      }
      return true;
    });
  }, [enrollments, query, courseFilter, statusFilter, roleFilter, learnerById]);

  function clearFilters() {
    setQuery("");
    setCourseFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
  }

  const hasFilters = query !== "" || courseFilter !== "all" || roleFilter !== "all" || statusFilter !== "all";

  const selectedCourse =
    selection?.type === "course" ? byCourse.find((c) => c.orgUnitId === selection.orgUnitId) ?? null : null;
  const selectedCourseRoster =
    selectedCourse !== null ? enrollments.filter((e) => e.orgUnitId === selectedCourse.orgUnitId) : [];

  const selectedLearner =
    selection?.type === "learner" ? learnerById.get(selection.learnerId) ?? null : null;
  const selectedLearnerEnrollments =
    selection?.type === "learner" ? enrollments.filter((e) => e.learnerId === selection.learnerId) : [];

  return (
    <>
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
        {byCourse.map((course) => (
          <button
            key={course.orgUnitId}
            type="button"
            onClick={() => setSelection({ type: "course", orgUnitId: course.orgUnitId })}
            className="block w-full border-b border-line-soft px-[18px] py-4 text-left transition-colors last:border-b-0 hover:bg-hover-tint"
          >
            <div className="mb-2.5 flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{course.courseName}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                  {course.enrolled} enrolled · {course.completed} done ·{" "}
                  {course.medianDaysToComplete !== null
                    ? `~${course.medianDaysToComplete}d to finish · `
                    : ""}
                  {course.survey && course.survey.avgUsefulness !== null
                    ? `${course.survey.avgUsefulness}/5 (${course.survey.responses}) · `
                    : ""}
                  {course.lastActivityAt
                    ? `active ${formatRelative(course.lastActivityAt)}`
                    : "no activity yet"}
                </p>
                {course.dropOffModule ? (
                  <p className="mt-0.5 font-mono text-[11px] text-status-warn-ink">
                    drop-off: {course.dropOffModule}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
                {course.avgCompletionPct}%
              </span>
            </div>
            <ProgressBar course={course} />
          </button>
        ))}
      </div>

      {/* Learners */}
      <div className="mb-3">
        <span className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">
          Learners
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <label className="relative">
          <IconSearch
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="w-64 rounded-lg border border-line bg-surface py-1.5 pl-9 pr-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <select
          value={courseFilter === "all" ? "all" : String(courseFilter)}
          onChange={(e) => setCourseFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
          className={selectClass}
          aria-label="Filter by course"
        >
          <option value="all">All courses</option>
          {byCourse.map((c) => (
            <option key={c.orgUnitId} value={c.orgUnitId}>
              {c.courseName}
            </option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as LearnerRole | "all")}
          className={selectClass}
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABEL[role]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LearnerStatus | "all")}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>

        <span className="ml-auto font-mono text-xs text-ink-soft">
          {filtered.length} of {enrollments.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No learners match these filters">
          <p>Try broadening the search or clearing the filters.</p>
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className="btn-secondary mt-3">
              Clear filters
            </button>
          ) : null}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {filtered.map((row) => (
            <button
              key={`${row.learnerId}-${row.orgUnitId}`}
              type="button"
              onClick={() => setSelection({ type: "learner", learnerId: row.learnerId })}
              className="flex w-full items-center gap-3.5 border-b border-line-soft px-[18px] py-3.5 text-left transition-colors last:border-b-0 hover:bg-hover-tint"
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
            </button>
          ))}
        </div>
      )}

      <CourseProgressDrawer
        course={selectedCourse}
        roster={selectedCourseRoster}
        onSelectLearner={(learnerId) => setSelection({ type: "learner", learnerId })}
        onClose={() => setSelection(null)}
      />
      <LearnerDrawer
        learner={selectedLearner}
        enrollments={selectedLearnerEnrollments}
        onClose={() => setSelection(null)}
      />
    </>
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

export function LearnerRoster(props: {
  byCourse: CourseProgress[];
  learners: LearnerRecord[];
  enrollments: LearnerActivity[];
}) {
  return (
    <Suspense fallback={null}>
      <LearnerRosterInner {...props} />
    </Suspense>
  );
}
