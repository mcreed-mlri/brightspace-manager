import { mockCourseOfferings } from "@/lib/fixtures/courses";
import type {
  AbandonmentReasons,
  Enrollment,
  LearnerRecord,
  LearnerStatus,
  SurveySummary,
} from "@/types/domain";

/* Mock learner roster + enrollment join for the LACE platform. Course-level
   reports (CourseProgress, LearnerActivity) are derived from this roster in
   lib/data/learners.ts, so filtering/drill-down numbers stay internally
   consistent. Real Brightspace/Supabase enrollment data replaces this once a
   reader exists (see lib/data/learners).

   Course participation counts here are scaled down from an earlier,
   hand-authored 96-learner fixture (factor ~0.375) to fit a roster small
   enough to hand-author individually, while keeping each course's relative
   health story (e.g. "Emergency Assistance is struggling") intact. */

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const mockLearners: LearnerRecord[] = [
  { id: "lrn-001", name: "Dana Okafor", email: "dokafor@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-002", name: "Marcus Bell", email: "mbell@example-legalaid.org", role: "advocate", jurisdiction: "Massachusetts" },
  { id: "lrn-003", name: "Priya Nair", email: "pnair@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-004", name: "Sofia Reyes", email: "sreyes@example-legalaid.org", role: "paralegal", jurisdiction: "Massachusetts" },
  { id: "lrn-005", name: "James Whitlock", email: "jwhitlock@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-006", name: "Aisha Rahman", email: "arahman@example-legalaid.org", role: "advocate", jurisdiction: "Massachusetts" },
  { id: "lrn-007", name: "Tom Delgado", email: "tdelgado@example-legalaid.org", role: "paralegal", jurisdiction: "Massachusetts" },
  { id: "lrn-008", name: "Hannah Cole", email: "hcole@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-009", name: "Wei Zhang", email: "wzhang@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-010", name: "Latoya Simmons", email: "lsimmons@example-legalaid.org", role: "advocate", jurisdiction: "Massachusetts" },
  { id: "lrn-011", name: "Ricardo Vega", email: "rvega@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-012", name: "Emily Chan", email: "echan@example-legalaid.org", role: "paralegal", jurisdiction: "Massachusetts" },
  { id: "lrn-013", name: "Noah Fitzgerald", email: "nfitzgerald@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-014", name: "Grace Odom", email: "godom@example-legalaid.org", role: "support", jurisdiction: "Massachusetts" },
  { id: "lrn-015", name: "Karim Haddad", email: "khaddad@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-016", name: "Olivia Marsh", email: "omarsh@example-legalaid.org", role: "advocate", jurisdiction: "Massachusetts" },
  { id: "lrn-017", name: "Derek Pham", email: "dpham@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-018", name: "Nina Alvarado", email: "nalvarado@example-legalaid.org", role: "paralegal", jurisdiction: "Massachusetts" },
  { id: "lrn-019", name: "Samuel Oyelaran", email: "soyelaran@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-020", name: "Claire Boucher", email: "cboucher@example-legalaid.org", role: "advocate", jurisdiction: "Massachusetts" },
  { id: "lrn-021", name: "Jordan Ellis", email: "jellis@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-022", name: "Maya Feldman", email: "mfeldman@example-legalaid.org", role: "paralegal", jurisdiction: "Massachusetts" },
  { id: "lrn-023", name: "Ben Okonkwo", email: "bokonkwo@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-024", name: "Rachel Stein", email: "rstein@example-legalaid.org", role: "support", jurisdiction: "Massachusetts" },
  { id: "lrn-025", name: "Victor Nguyen", email: "vnguyen@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-026", name: "Chloe Dupont", email: "cdupont@example-legalaid.org", role: "advocate", jurisdiction: "Massachusetts" },
  { id: "lrn-027", name: "Elias Brennan", email: "ebrennan@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-028", name: "Fatima Siddiqui", email: "fsiddiqui@example-legalaid.org", role: "paralegal", jurisdiction: "Massachusetts" },
  { id: "lrn-029", name: "Colin Doyle", email: "cdoyle@example-legalaid.org", role: "advocate", jurisdiction: "Massachusetts" },
  { id: "lrn-030", name: "Renee Ashworth", email: "rashworth@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-031", name: "Miguel Santos", email: "msantos@example-legalaid.org", role: "paralegal", jurisdiction: "Massachusetts" },
  { id: "lrn-032", name: "Ingrid Larsen", email: "ilarsen@example-legalaid.org", role: "advocate", jurisdiction: "Massachusetts" },
  { id: "lrn-033", name: "Devon Marsh", email: "dmarsh@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-034", name: "Yasmin Ali", email: "yali@example-legalaid.org", role: "support", jurisdiction: "Massachusetts" },
  { id: "lrn-035", name: "Patrick Nolan", email: "pnolan@example-legalaid.org", role: "attorney", jurisdiction: "Massachusetts" },
  { id: "lrn-036", name: "Beatrice Lowry", email: "blowry@example-legalaid.org", role: "support", jurisdiction: "Massachusetts" },
];

const ROSTER_SIZE = mockLearners.length; // 36

/* Per-course shape scaled from the earlier 96-learner fixture: [enrolled,
   completedFrac, inProgressFrac, notStartedFrac, dropOffModule, survey,
   abandonment]. Fractions come from that fixture's completed/inProgress/
   notStarted split, so each course's relative health story survives the
   rescale even though absolute counts shrink. */
const courseSpec: {
  orgUnitId: number;
  enrolled: number;
  completedFrac: number;
  inProgressFrac: number;
  dropOffModule: string | null;
  survey: SurveySummary;
  abandonment: AbandonmentReasons;
}[] = [
  {
    orgUnitId: 6735, // Welcome to LACE
    enrolled: 31,
    completedFrac: 71 / 84,
    inProgressFrac: 9 / 84,
    dropOffModule: null,
    survey: { avgUsefulness: 4.6, responses: 20 },
    abandonment: { tooBusy: 1, tooLong: 0, notRelevant: 0, needHelp: 0 },
  },
  {
    orgUnitId: 6739, // Trauma-Informed Client Interviewing
    enrolled: 18,
    completedFrac: 30 / 47,
    inProgressFrac: 12 / 47,
    dropOffModule: "Module 3: Role-play scenarios",
    survey: { avgUsefulness: 4.8, responses: 9 },
    abandonment: { tooBusy: 1, tooLong: 0, notRelevant: 0, needHelp: 0 },
  },
  {
    orgUnitId: 6703, // Eviction Defense: The First 48 Hours
    enrolled: 20,
    completedFrac: 23 / 52,
    inProgressFrac: 21 / 52,
    dropOffModule: "Module 4: Answer drafting workshop",
    survey: { avgUsefulness: 4.4, responses: 6 },
    abandonment: { tooBusy: 2, tooLong: 1, notRelevant: 0, needHelp: 1 },
  },
  {
    orgUnitId: 6718, // SNAP Benefits: Eligibility and Appeals
    enrolled: 15,
    completedFrac: 19 / 41,
    inProgressFrac: 14 / 41,
    dropOffModule: "Module 5: Appeals practice",
    survey: { avgUsefulness: 4.1, responses: 5 },
    abandonment: { tooBusy: 1, tooLong: 0, notRelevant: 0, needHelp: 0 },
  },
  {
    orgUnitId: 6712, // Summary Process: Answer and Discovery
    enrolled: 14,
    completedFrac: 14 / 38,
    inProgressFrac: 17 / 38,
    dropOffModule: "Module 3: Discovery requests",
    survey: { avgUsefulness: 4.3, responses: 3 },
    abandonment: { tooBusy: 2, tooLong: 1, notRelevant: 0, needHelp: 0 },
  },
  {
    orgUnitId: 6726, // 209A Protective Orders: Practice Basics
    enrolled: 11,
    completedFrac: 11 / 29,
    inProgressFrac: 12 / 29,
    dropOffModule: "Module 2: Hearing preparation",
    survey: { avgUsefulness: 4.5, responses: 3 },
    abandonment: { tooBusy: 1, tooLong: 0, notRelevant: 0, needHelp: 0 },
  },
  {
    orgUnitId: 6731, // Debt Collection Defense in District Court
    enrolled: 12,
    completedFrac: 8 / 33,
    inProgressFrac: 15 / 33,
    dropOffModule: "Module 2: Validation letters",
    survey: { avgUsefulness: 3.9, responses: 2 },
    abandonment: { tooBusy: 2, tooLong: 1, notRelevant: 0, needHelp: 0 },
  },
  {
    orgUnitId: 6748, // Housing Conditions: Code Enforcement Clinic
    enrolled: 8,
    completedFrac: 6 / 22,
    inProgressFrac: 9 / 22,
    dropOffModule: "Module 3: Inspection walkthrough",
    survey: { avgUsefulness: 4.0, responses: 1 },
    abandonment: { tooBusy: 1, tooLong: 1, notRelevant: 0, needHelp: 0 },
  },
  {
    orgUnitId: 6721, // Emergency Assistance Shelter Advocacy
    enrolled: 7,
    completedFrac: 3 / 18,
    inProgressFrac: 5 / 18,
    dropOffModule: "Module 1: EA eligibility rules",
    survey: { avgUsefulness: 3.6, responses: 1 },
    abandonment: { tooBusy: 2, tooLong: 0, notRelevant: 1, needHelp: 1 },
  },
];

export const courseMeta: Record<
  number,
  { dropOffModule: string | null; survey: SurveySummary; abandonment: AbandonmentReasons }
> = Object.fromEntries(
  courseSpec.map((spec) => [
    spec.orgUnitId,
    { dropOffModule: spec.dropOffModule, survey: spec.survey, abandonment: spec.abandonment },
  ]),
);

/* Deterministic circular slice of the roster, one course apart by a fixed
   step (coprime with ROSTER_SIZE so slices spread out rather than repeat
   the same starting point). No RNG — reproducible on every server start. */
const ROTATION_STEP = 7;

function rosterSlice(courseIndex: number, size: number): number[] {
  const start = (courseIndex * ROTATION_STEP) % ROSTER_SIZE;
  return Array.from({ length: size }, (_, i) => (start + i) % ROSTER_SIZE);
}

function buildEnrollments(): Enrollment[] {
  const enrollments: Enrollment[] = [];

  courseSpec.forEach((spec, courseIndex) => {
    const indices = rosterSlice(courseIndex, spec.enrolled);
    const completedCount = Math.round(spec.enrolled * spec.completedFrac);
    const inProgressCount = Math.round(spec.enrolled * spec.inProgressFrac);

    indices.forEach((learnerIndex, slotIndex) => {
      const learner = mockLearners[learnerIndex];
      const enrolledAt = daysAgo(20 + ((courseIndex * 5 + slotIndex * 3) % 60));

      let status: LearnerStatus;
      let progressPct: number;
      let completedAt: string | null;
      let lastActiveAt: string | null;

      if (slotIndex < completedCount) {
        status = "completed";
        progressPct = 100;
        completedAt = daysAgo((slotIndex * 2) % 10);
        lastActiveAt = completedAt;
      } else if (slotIndex < completedCount + inProgressCount) {
        status = "in-progress";
        progressPct = 15 + ((slotIndex * 11 + courseIndex * 7) % 80);
        completedAt = null;
        lastActiveAt = slotIndex % 2 === 0 ? hoursAgo(2 + slotIndex) : daysAgo(1 + (slotIndex % 5));
      } else {
        status = "not-started";
        progressPct = 0;
        completedAt = null;
        lastActiveAt = null;
      }

      enrollments.push({
        learnerId: learner.id,
        orgUnitId: spec.orgUnitId,
        status,
        progressPct,
        enrolledAt,
        completedAt,
        lastActiveAt,
      });
    });
  });

  return enrollments;
}

export const mockEnrollments: Enrollment[] = buildEnrollments();

export function courseNameAndJurisdiction(orgUnitId: number): {
  courseName: string;
  jurisdiction: string | null;
} {
  const offering = mockCourseOfferings.find((c) => c.orgUnitId === orgUnitId);
  return {
    courseName: offering?.name ?? "Unknown course",
    jurisdiction: offering?.jurisdiction ?? null,
  };
}
