import "server-only";

import { mockResult } from "@/lib/data/envelope";
import {
  courseMeta,
  courseNameAndJurisdiction,
  mockEnrollments,
  mockLearners,
} from "@/lib/fixtures/learners";
import type {
  AbandonmentReasons,
  CourseProgress,
  DataResult,
  Enrollment,
  LearnerActivity,
  LearnerProgressReport,
  LearnerRecord,
} from "@/types/domain";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / (24 * 60 * 60 * 1000),
  );
}

/* Course-level rollup, derived from the enrollment join so filtered numbers
   (e.g. the Learners page roster) always agree with these totals. */
function buildCourseProgress(enrollments: Enrollment[]): CourseProgress[] {
  const byOrgUnit = new Map<number, Enrollment[]>();
  for (const enrollment of enrollments) {
    const rows = byOrgUnit.get(enrollment.orgUnitId) ?? [];
    rows.push(enrollment);
    byOrgUnit.set(enrollment.orgUnitId, rows);
  }

  const now = Date.now();

  return [...byOrgUnit.entries()].map(([orgUnitId, rows]) => {
    const enrolled = rows.length;
    const completed = rows.filter((r) => r.status === "completed").length;
    const inProgress = rows.filter((r) => r.status === "in-progress").length;
    const notStarted = rows.filter((r) => r.status === "not-started").length;
    const avgCompletionPct =
      enrolled === 0 ? 0 : Math.round(rows.reduce((sum, r) => sum + r.progressPct, 0) / enrolled);

    const activityTimestamps = rows
      .map((r) => r.lastActiveAt)
      .filter((v): v is string => v !== null);
    const lastActivityAt =
      activityTimestamps.length === 0
        ? null
        : activityTimestamps.reduce((latest, ts) =>
            new Date(ts).getTime() > new Date(latest).getTime() ? ts : latest,
          );

    const completers = rows.filter((r) => r.status === "completed" && r.completedAt !== null);
    const medianDaysToComplete =
      completers.length === 0
        ? null
        : median(completers.map((r) => daysBetween(r.enrolledAt, r.completedAt as string)));

    const eligibleFor30d = rows.filter(
      (r) => now - new Date(r.enrolledAt).getTime() >= THIRTY_DAYS_MS,
    );
    const completedWithin30d = eligibleFor30d.filter(
      (r) =>
        r.status === "completed" &&
        r.completedAt !== null &&
        daysBetween(r.enrolledAt, r.completedAt) <= 30,
    );
    const pctCompletedWithin30d =
      eligibleFor30d.length === 0
        ? null
        : Math.round((completedWithin30d.length / eligibleFor30d.length) * 100);

    const meta = courseMeta[orgUnitId];
    const { courseName, jurisdiction } = courseNameAndJurisdiction(orgUnitId);

    return {
      orgUnitId,
      courseName,
      jurisdiction,
      enrolled,
      completed,
      inProgress,
      notStarted,
      avgCompletionPct,
      lastActivityAt,
      medianDaysToComplete,
      pctCompletedWithin30d,
      dropOffModule: meta?.dropOffModule ?? null,
      survey: meta?.survey ?? null,
      abandonment: meta?.abandonment ?? null,
    };
  });
}

/* One row per enrollment (learner x course) — the full join backing the
   Learners page roster/filter UI and both drill-down drawers. */
function buildEnrollmentRows(
  enrollments: Enrollment[],
  learners: LearnerRecord[],
): LearnerActivity[] {
  const learnerById = new Map(learners.map((l) => [l.id, l]));

  return enrollments
    .map((enrollment) => {
      const learner = learnerById.get(enrollment.learnerId);
      const { courseName } = courseNameAndJurisdiction(enrollment.orgUnitId);
      return {
        learnerId: enrollment.learnerId,
        orgUnitId: enrollment.orgUnitId,
        name: learner?.name ?? "Unknown learner",
        email: learner?.email ?? "",
        courseName,
        status: enrollment.status,
        progressPct: enrollment.progressPct,
        lastActiveAt: enrollment.lastActiveAt ?? enrollment.enrolledAt,
      };
    })
    .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
}

/* Enrollment-weighted mean completion, so a 5-person course doesn't swing the
   org-wide number as hard as an 80-person one. */
function overallCompletion(courses: CourseProgress[]): number {
  const enrolled = courses.reduce((sum, c) => sum + c.enrolled, 0);
  if (enrolled === 0) return 0;
  const weighted = courses.reduce((sum, c) => sum + c.avgCompletionPct * c.enrolled, 0);
  return Math.round(weighted / enrolled);
}

/* Completers-weighted mean of per-course medians. A mean of medians is an
   approximation — the live rollup computes a true org-wide median instead. */
function orgMedianDaysToComplete(courses: CourseProgress[]): number | null {
  const withMedian = courses.filter((c) => c.medianDaysToComplete !== null && c.completed > 0);
  const completers = withMedian.reduce((sum, c) => sum + c.completed, 0);
  if (completers === 0) return null;
  const weighted = withMedian.reduce(
    (sum, c) => sum + (c.medianDaysToComplete as number) * c.completed,
    0,
  );
  return Math.round(weighted / completers);
}

function orgPctCompletedWithin30d(courses: CourseProgress[]): number | null {
  const withPct = courses.filter((c) => c.pctCompletedWithin30d !== null);
  const enrolled = withPct.reduce((sum, c) => sum + c.enrolled, 0);
  if (enrolled === 0) return null;
  const weighted = withPct.reduce(
    (sum, c) => sum + (c.pctCompletedWithin30d as number) * c.enrolled,
    0,
  );
  return Math.round(weighted / enrolled);
}

function orgSurvey(courses: CourseProgress[]): LearnerProgressReport["survey"] {
  const withSurvey = courses.filter((c) => c.survey && c.survey.responses > 0);
  const responses = withSurvey.reduce((sum, c) => sum + (c.survey?.responses ?? 0), 0);
  const completions = courses.reduce((sum, c) => sum + c.completed, 0);
  if (responses === 0) {
    return { avgUsefulness: null, responses: 0, responseRatePct: null };
  }
  const weighted = withSurvey.reduce(
    (sum, c) => sum + (c.survey?.avgUsefulness ?? 0) * (c.survey?.responses ?? 0),
    0,
  );
  return {
    avgUsefulness: Math.round((weighted / responses) * 10) / 10,
    responses,
    responseRatePct: completions === 0 ? null : Math.round((responses / completions) * 100),
  };
}

function orgAbandonment(courses: CourseProgress[]): AbandonmentReasons {
  return courses.reduce(
    (totals, c) => ({
      tooBusy: totals.tooBusy + (c.abandonment?.tooBusy ?? 0),
      tooLong: totals.tooLong + (c.abandonment?.tooLong ?? 0),
      notRelevant: totals.notRelevant + (c.abandonment?.notRelevant ?? 0),
      needHelp: totals.needHelp + (c.abandonment?.needHelp ?? 0),
    }),
    { tooBusy: 0, tooLong: 0, notRelevant: 0, needHelp: 0 },
  );
}

function buildReport(): LearnerProgressReport {
  const byCourse = buildCourseProgress(mockEnrollments).sort((a, b) => b.enrolled - a.enrolled);
  const enrollments = buildEnrollmentRows(mockEnrollments, mockLearners);

  const now = Date.now();
  const activeLearnerIds = new Set(
    mockEnrollments
      .filter(
        (e) =>
          e.lastActiveAt !== null && now - new Date(e.lastActiveAt).getTime() <= THIRTY_DAYS_MS,
      )
      .map((e) => e.learnerId),
  );

  return {
    generatedAt: new Date().toISOString(),
    totalLearners: mockLearners.length,
    activeLearners: activeLearnerIds.size,
    coursesWithEnrollment: byCourse.filter((c) => c.enrolled > 0).length,
    overallCompletionPct: overallCompletion(byCourse),
    medianDaysToComplete: orgMedianDaysToComplete(byCourse),
    pctCompletedWithin30d: orgPctCompletedWithin30d(byCourse),
    survey: orgSurvey(byCourse),
    abandonment: orgAbandonment(byCourse),
    byCourse,
    learners: mockLearners,
    enrollments,
  };
}

/* Org-wide learner progress. No live source yet — Brightspace classlist +
   completion reads (or a Supabase rollup) replace the fixture here, returning
   liveResult, once the enrollment data is available. */
export async function getLearnerProgress(): Promise<DataResult<LearnerProgressReport>> {
  return mockResult(buildReport());
}
