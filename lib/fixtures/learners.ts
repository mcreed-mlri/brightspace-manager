import type { CourseProgress, LearnerActivity } from "@/types/domain";

/* Mock learner progress for the LACE platform. Course names and org unit IDs
   mirror lib/fixtures/courses.ts so the inventory and progress screens agree.
   Numbers are invented but internally consistent: completed + inProgress +
   notStarted === enrolled for every course. Real Brightspace/Supabase
   enrollment data replaces this once a reader exists (see lib/data/learners). */

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const mockCourseProgress: CourseProgress[] = [
  {
    orgUnitId: 6735,
    courseName: "Welcome to LACE",
    jurisdiction: "Massachusetts",
    enrolled: 84,
    completed: 71,
    inProgress: 9,
    notStarted: 4,
    avgCompletionPct: 88,
    lastActivityAt: hoursAgo(2),
  },
  {
    orgUnitId: 6739,
    courseName: "Trauma-Informed Client Interviewing",
    jurisdiction: "Massachusetts",
    enrolled: 47,
    completed: 30,
    inProgress: 12,
    notStarted: 5,
    avgCompletionPct: 72,
    lastActivityAt: daysAgo(1),
  },
  {
    orgUnitId: 6703,
    courseName: "Eviction Defense: The First 48 Hours",
    jurisdiction: "Massachusetts",
    enrolled: 52,
    completed: 23,
    inProgress: 21,
    notStarted: 8,
    avgCompletionPct: 61,
    lastActivityAt: hoursAgo(5),
  },
  {
    orgUnitId: 6718,
    courseName: "SNAP Benefits: Eligibility and Appeals",
    jurisdiction: "Massachusetts",
    enrolled: 41,
    completed: 19,
    inProgress: 14,
    notStarted: 8,
    avgCompletionPct: 58,
    lastActivityAt: daysAgo(1),
  },
  {
    orgUnitId: 6712,
    courseName: "Summary Process: Answer and Discovery",
    jurisdiction: "Massachusetts",
    enrolled: 38,
    completed: 14,
    inProgress: 17,
    notStarted: 7,
    avgCompletionPct: 52,
    lastActivityAt: daysAgo(1),
  },
  {
    orgUnitId: 6726,
    courseName: "209A Protective Orders: Practice Basics",
    jurisdiction: "Massachusetts",
    enrolled: 29,
    completed: 11,
    inProgress: 12,
    notStarted: 6,
    avgCompletionPct: 49,
    lastActivityAt: daysAgo(2),
  },
  {
    orgUnitId: 6731,
    courseName: "Debt Collection Defense in District Court",
    jurisdiction: "Massachusetts",
    enrolled: 33,
    completed: 8,
    inProgress: 15,
    notStarted: 10,
    avgCompletionPct: 41,
    lastActivityAt: daysAgo(2),
  },
  {
    orgUnitId: 6748,
    courseName: "Housing Conditions: Code Enforcement Clinic",
    jurisdiction: "Massachusetts",
    enrolled: 22,
    completed: 6,
    inProgress: 9,
    notStarted: 7,
    avgCompletionPct: 38,
    lastActivityAt: daysAgo(3),
  },
  {
    orgUnitId: 6721,
    courseName: "Emergency Assistance Shelter Advocacy",
    jurisdiction: "Massachusetts",
    enrolled: 18,
    completed: 3,
    inProgress: 5,
    notStarted: 10,
    avgCompletionPct: 24,
    lastActivityAt: daysAgo(11),
  },
];

export const mockRecentActivity: LearnerActivity[] = [
  {
    name: "Dana Okafor",
    email: "dokafor@example-legalaid.org",
    courseName: "Eviction Defense: The First 48 Hours",
    status: "in-progress",
    progressPct: 64,
    lastActiveAt: hoursAgo(2),
  },
  {
    name: "Marcus Bell",
    email: "mbell@example-legalaid.org",
    courseName: "Welcome to LACE",
    status: "completed",
    progressPct: 100,
    lastActiveAt: hoursAgo(4),
  },
  {
    name: "Priya Nair",
    email: "pnair@example-legalaid.org",
    courseName: "Trauma-Informed Client Interviewing",
    status: "in-progress",
    progressPct: 78,
    lastActiveAt: hoursAgo(6),
  },
  {
    name: "Sofia Reyes",
    email: "sreyes@example-legalaid.org",
    courseName: "SNAP Benefits: Eligibility and Appeals",
    status: "in-progress",
    progressPct: 45,
    lastActiveAt: hoursAgo(9),
  },
  {
    name: "James Whitlock",
    email: "jwhitlock@example-legalaid.org",
    courseName: "Summary Process: Answer and Discovery",
    status: "completed",
    progressPct: 100,
    lastActiveAt: daysAgo(1),
  },
  {
    name: "Aisha Rahman",
    email: "arahman@example-legalaid.org",
    courseName: "209A Protective Orders: Practice Basics",
    status: "in-progress",
    progressPct: 33,
    lastActiveAt: daysAgo(1),
  },
  {
    name: "Tom Delgado",
    email: "tdelgado@example-legalaid.org",
    courseName: "Debt Collection Defense in District Court",
    status: "not-started",
    progressPct: 0,
    lastActiveAt: daysAgo(2),
  },
  {
    name: "Hannah Cole",
    email: "hcole@example-legalaid.org",
    courseName: "Housing Conditions: Code Enforcement Clinic",
    status: "in-progress",
    progressPct: 51,
    lastActiveAt: daysAgo(2),
  },
];

/* Distinct people, not enrollments — a learner may appear in several courses. */
export const mockLearnerTotals = {
  totalLearners: 96,
  activeLearners: 74,
};
