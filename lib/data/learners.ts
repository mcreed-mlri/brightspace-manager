import "server-only";

import { mockResult } from "@/lib/data/envelope";
import {
  mockCourseProgress,
  mockLearnerTotals,
  mockRecentActivity,
} from "@/lib/fixtures/learners";
import type { CourseProgress, DataResult, LearnerProgressReport } from "@/types/domain";

/* Enrollment-weighted mean completion, so a 5-person course doesn't swing the
   org-wide number as hard as an 80-person one. */
function overallCompletion(courses: CourseProgress[]): number {
  const enrolled = courses.reduce((sum, c) => sum + c.enrolled, 0);
  if (enrolled === 0) return 0;
  const weighted = courses.reduce((sum, c) => sum + c.avgCompletionPct * c.enrolled, 0);
  return Math.round(weighted / enrolled);
}

function buildReport(courses: CourseProgress[]): LearnerProgressReport {
  const byCourse = [...courses].sort((a, b) => b.enrolled - a.enrolled);
  return {
    generatedAt: new Date().toISOString(),
    totalLearners: mockLearnerTotals.totalLearners,
    activeLearners: mockLearnerTotals.activeLearners,
    coursesWithEnrollment: byCourse.filter((c) => c.enrolled > 0).length,
    overallCompletionPct: overallCompletion(byCourse),
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
