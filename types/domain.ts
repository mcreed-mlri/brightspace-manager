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
