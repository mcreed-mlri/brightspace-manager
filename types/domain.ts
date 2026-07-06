/* Domain types shared across the data layer, API routes, and UI. */

export type DataSource = "mock" | "live";

/* Every data-layer function returns this envelope. `source` powers the
   MockDataBanner so fixture data can never masquerade as live data. */
export type DataResult<T> = {
  data: T;
  source: DataSource;
  fetchedAt: string;
};

export type SyncState = "synced" | "stale" | "never-synced" | "unknown";

export type CourseOffering = {
  orgUnitId: number;
  name: string;
  code: string;
  jurisdiction: string | null;
  program: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  syncState: SyncState;
  /* `${BRIGHTSPACE_BASE_URL}/d2l/home/${orgUnitId}` */
  brightspaceUrl: string;
};

/* Metadata fields the inventory flags when absent. */
export function missingMetadata(offering: CourseOffering): string[] {
  const missing: string[] = [];
  if (!offering.jurisdiction) missing.push("jurisdiction");
  if (!offering.program) missing.push("program");
  if (!offering.code) missing.push("code");
  return missing;
}

export type FileNode = {
  name: string;
  path: string;
  kind: "folder" | "file";
  sizeBytes?: number;
  modifiedAt?: string;
  children?: FileNode[];
};

export type SyncWarning = {
  orgUnitId: number;
  courseName: string;
  message: string;
  severity: "warn" | "error";
};

export type SyncStatus = {
  lastRunAt: string | null;
  coursesInBrightspace: number;
  coursesInSupabase: number;
  driftCount: number;
  warnings: SyncWarning[];
};

/* Per-course result of a sync check. */
export type DiagnosticState = "healthy" | "needs-review" | "broken" | "unknown";

export type CourseDiagnostic = {
  orgUnitId: number;
  name: string;
  state: DiagnosticState;
  issues: string[];
};

/* Supabase row with no matching Brightspace course offering. */
export type SupabaseOrphan = {
  providerCourseId: string;
  title: string;
  reason: string;
};

export type SyncReport = {
  ranAt: string;
  coursesInBrightspace: number;
  coursesInSupabase: number;
  healthy: number;
  needsReview: number;
  broken: number;
  diagnostics: CourseDiagnostic[];
  orphans: SupabaseOrphan[];
};

/* A planned change to one learning_items row, computed before any write. */
export type SyncPlanItem = {
  orgUnitId: number;
  name: string;
  action: "create" | "update";
  changes: string[];
};

export type SyncPlan = {
  builtAt: string;
  toCreate: SyncPlanItem[];
  toUpdate: SyncPlanItem[];
  unchanged: number;
  /* Rows left alone because their Brightspace course vanished — never deleted. */
  orphansLeftAlone: number;
};

export type SyncRunResult = {
  ranAt: string;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
};

export type SyncAuditEntry = {
  ranAt: string;
  created: number;
  updated: number;
  failed: number;
  /* Signed-in email of whoever ran it; absent for pre-auth entries and
     open mock/dev mode. */
  actor?: string;
};

/* Learner progress — org-wide monitoring of enrolled learners across LACE
   courses. No live source yet; served from fixtures behind a DataResult so a
   Supabase/Brightspace reader can slot in without touching the UI. */
export type LearnerStatus = "completed" | "in-progress" | "not-started";

/* Post-completion rating card results ("How useful was this course?"),
   collected by the hub and stored in Supabase `feedback`. */
export type SurveySummary = {
  /* Mean 1–5 usefulness rating; null until anyone has answered. */
  avgUsefulness: number | null;
  responses: number;
};

/* Why learners say they stopped — counts from the hub's stalled-course nudge
   (Supabase feedback.flag). The signal completion rates can't give: whether
   busy people ran out of time, the course ran long, or they need a human. */
export type AbandonmentReasons = {
  tooBusy: number;
  tooLong: number;
  notRelevant: number;
  needHelp: number;
};

export type CourseProgress = {
  orgUnitId: number;
  courseName: string;
  jurisdiction: string | null;
  enrolled: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  /* Mean percent-complete across enrolled learners, 0–100. */
  avgCompletionPct: number;
  lastActivityAt: string | null;
  /* Efficiency metrics — the "does it fit a busy week" frame from
     docs/planning/metrics-framework.md. Null until a completion source exists
     (or the course has no completers yet). */
  medianDaysToComplete: number | null;
  /* Completers within 30 days of enrolling ÷ everyone enrolled ≥30 days ago, 0–100. */
  pctCompletedWithin30d: number | null;
  /* Module with the largest visit fall-off — where learners stop. */
  dropOffModule: string | null;
  survey: SurveySummary | null;
  abandonment: AbandonmentReasons | null;
};

export type LearnerActivity = {
  learnerId: string;
  orgUnitId: number;
  name: string;
  email: string;
  courseName: string;
  status: LearnerStatus;
  progressPct: number;
  lastActiveAt: string;
};

export type LearnerRole = "attorney" | "advocate" | "paralegal" | "support";

/* A distinct person, not an enrollment — a learner may appear in several
   courses via Enrollment/LearnerActivity rows. */
export type LearnerRecord = {
  id: string;
  name: string;
  email: string;
  role: LearnerRole;
  jurisdiction: string;
};

/* One learner's standing in one course — the join row CourseProgress and
   LearnerActivity are both derived from. */
export type Enrollment = {
  learnerId: string;
  orgUnitId: number;
  status: LearnerStatus;
  progressPct: number;
  enrolledAt: string;
  completedAt: string | null;
  lastActiveAt: string | null;
};

export type LearnerProgressReport = {
  generatedAt: string;
  totalLearners: number;
  /* Active within the last 30 days. */
  activeLearners: number;
  coursesWithEnrollment: number;
  /* Enrollment-weighted mean completion across all courses, 0–100. */
  overallCompletionPct: number;
  /* Completers-weighted mean of per-course medians — approximate until the
     live rollup computes a true org-wide median. Null with no completers. */
  medianDaysToComplete: number | null;
  /* Enrollment-weighted, 0–100. */
  pctCompletedWithin30d: number | null;
  /* Org-wide rating-card results; responseRatePct = responses ÷ completions, 0–100. */
  survey: SurveySummary & { responseRatePct: number | null };
  /* Org-wide stalled-course nudge counts. needHelp is a support queue, not
     just a metric — those learners are waiting on a human. */
  abandonment: AbandonmentReasons;
  byCourse: CourseProgress[];
  /* Full learner roster, for the learner drawer/filter lookups. */
  learners: LearnerRecord[];
  /* One row per enrollment (learner x course) — the full join, not a curated sample. */
  enrollments: LearnerActivity[];
};

export type EvaluationKpi = {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "flat";
};

export type EvaluationTrendPoint = {
  month: string;
  reach: number;
  completion: number;
  usefulness: number;
  confidenceDelta: number;
};

export type EvaluationSegment = {
  role: string;
  learners: number;
  completionPct: number;
  usefulness: number;
  confidenceDelta: number;
};

export type EvaluationCourseSignal = {
  orgUnitId: number;
  courseName: string;
  reach: number;
  completionPct: number;
  usefulness: number;
  medianDaysToComplete: number;
  risk: "healthy" | "watch" | "intervene";
};

export type EvaluationMetricReadiness = {
  metric: string;
  source: string;
  status: "ready" | "partial" | "planned";
  note: string;
};

export type EvaluationReport = {
  generatedAt: string;
  pilotWindow: string;
  thesis: string;
  kpis: EvaluationKpi[];
  trend: EvaluationTrendPoint[];
  segments: EvaluationSegment[];
  courseSignals: EvaluationCourseSignal[];
  readiness: EvaluationMetricReadiness[];
};

/* Curriculum Map — a team-editable planning wall (Legal Skills columns of
   topic/sub-topic notes + a Substantive Law tile grid). Stored as one JSONB
   document in the `curriculum_map` table; the whole map is saved at once. */
export type CurriculumNote = {
  id: string;
  text: string;
  level: "topic" | "sub";
  /* Optional badge shown on the note, e.g. "tentative" or "unit intro". */
  tag?: string;
  /* Private margin note — never rendered as card text; surfaced only on hover.
     For scratch remarks like "Does this really belong here?". */
  comment?: string;
};

export type CurriculumColumn = {
  id: string;
  title: string;
  notes: CurriculumNote[];
};

export type CurriculumTile = {
  id: string;
  text: string;
};

export type CurriculumBranch =
  | { id: string; title: string; type: "columns"; columns: CurriculumColumn[] }
  | { id: string; title: string; type: "grid"; tiles: CurriculumTile[] };

export type CurriculumMap = {
  branches: CurriculumBranch[];
};

export type HealthState = "ok" | "error" | "unconfigured";

export type HealthStatus = {
  service: "brightspace" | "supabase";
  status: HealthState;
  /* How the service is (or would be) authenticated. Never contains values. */
  mode?: string;
  detail?: string;
  checkedAt: string;
};

/* Mirrors learning-hub docs/planning/supabase-learning-items.sql */
export type LearningItemRow = {
  id: string;
  provider: string;
  provider_course_id: string | null;
  provider_module_id: string | null;
  item_type: "course" | "module" | "path";
  title: string;
  description: string | null;
  practice_area: string | null;
  level: string | null;
  duration_label: string | null;
  brightspace_url: string | null;
  metadata: Record<string, unknown>;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
};
