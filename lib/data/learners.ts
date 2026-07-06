import "server-only";

import { mockResult } from "@/lib/data/envelope";
import {
  mockCourseProgress,
  mockLearnerTotals,
  mockRecentActivity,
} from "@/lib/fixtures/learners";
import type {
  AbandonmentReasons,
  CourseProgress,
  DataResult,
  LearnerProgressReport,
} from "@/types/domain";

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

function buildReport(courses: CourseProgress[]): LearnerProgressReport {
  const byCourse = [...courses].sort((a, b) => b.enrolled - a.enrolled);
  return {
    generatedAt: new Date().toISOString(),
    totalLearners: mockLearnerTotals.totalLearners,
    activeLearners: mockLearnerTotals.activeLearners,
    coursesWithEnrollment: byCourse.filter((c) => c.enrolled > 0).length,
    overallCompletionPct: overallCompletion(byCourse),
    medianDaysToComplete: orgMedianDaysToComplete(byCourse),
    pctCompletedWithin30d: orgPctCompletedWithin30d(byCourse),
    survey: orgSurvey(byCourse),
    abandonment: orgAbandonment(byCourse),
    byCourse,
    recent: mockRecentActivity,
  };
}

/* Org-wide learner progress. No live source yet — Brightspace classlist +
   completion reads (or a Supabase rollup) replace the fixture here, returning
   liveResult, once the enrollment data is available. */
export async function getLearnerProgress(): Promise<DataResult<LearnerProgressReport>> {
  return mockResult(buildReport(mockCourseProgress));
}
