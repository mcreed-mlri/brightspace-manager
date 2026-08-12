import "server-only";

import { listCourseOfferings } from "@/lib/data/courses";
import { listLearningItems } from "@/lib/data/learning-items";
import type {
  CourseDiagnostic,
  DataResult,
  DiagnosticState,
  SyncReport,
  SyncStatus,
} from "@/types/domain";

const STALE_AFTER_DAYS = 30;

/* The real diff engine: compares Brightspace course offerings against the
   Supabase learning_items cache. The comparison logic is live today — only
   the inputs fall back to fixtures until credentials are configured. */
export async function runSyncCheck(): Promise<DataResult<SyncReport>> {
  const [courses, items] = await Promise.all([listCourseOfferings(), listLearningItems()]);
  const source = courses.source === "live" && items.source === "live" ? "live" : "mock";

  const itemsByCourseId = new Map(
    items.data
      .filter((item) => item.provider_course_id)
      .map((item) => [item.provider_course_id as string, item]),
  );

  const diagnostics: CourseDiagnostic[] = courses.data.map((course) => {
    const item = itemsByCourseId.get(String(course.orgUnitId));
    const issues: string[] = [];
    let state: DiagnosticState = "healthy";

    if (!item) {
      issues.push(
        course.isActive
          ? "Active in Brightspace but missing from the Supabase cache."
          : "Archived in Brightspace and missing from the Supabase cache.",
      );
      state = course.isActive ? "broken" : "needs-review";
    } else {
      if (item.title.trim() !== course.name.trim()) {
        issues.push(`Title mismatch: Supabase has "${item.title}".`);
      }
      const syncedMs = item.synced_at ? Date.parse(item.synced_at) : NaN;
      if (!Number.isFinite(syncedMs)) {
        issues.push("Supabase row has no synced_at timestamp.");
      } else if (
        course.isActive &&
        Date.now() - syncedMs > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000
      ) {
        issues.push(`Cache is stale: last synced over ${STALE_AFTER_DAYS} days ago.`);
      }
    }

    if (!course.jurisdiction) issues.push("Missing jurisdiction.");
    if (!course.program) issues.push("Missing program/category.");

    if (state === "healthy" && issues.length > 0) state = "needs-review";
    return { orgUnitId: course.orgUnitId, name: course.name, state, issues };
  });

  const knownCourseIds = new Set(courses.data.map((c) => String(c.orgUnitId)));
  const orphans = items.data
    .filter((item) => item.provider_course_id && !knownCourseIds.has(item.provider_course_id))
    .map((item) => ({
      providerCourseId: item.provider_course_id as string,
      title: item.title,
      reason: "No matching Brightspace course offering. It may have been removed outside the sync.",
    }));

  const report: SyncReport = {
    ranAt: new Date().toISOString(),
    coursesInBrightspace: courses.data.length,
    coursesInSupabase: items.data.length,
    healthy: diagnostics.filter((d) => d.state === "healthy").length,
    needsReview: diagnostics.filter((d) => d.state === "needs-review").length,
    broken: diagnostics.filter((d) => d.state === "broken").length,
    diagnostics,
    orphans,
  };

  return { data: report, source, fetchedAt: report.ranAt };
}

/* Compact summary derived from the full report — keeps the dashboard numbers
   consistent with the diagnostics page. */
export async function getSyncStatus(): Promise<DataResult<SyncStatus>> {
  const result = await runSyncCheck();
  const report = result.data;

  const warnings = [
    ...report.diagnostics
      .filter((d) => d.state !== "healthy")
      .map((d) => ({
        orgUnitId: d.orgUnitId,
        courseName: d.name,
        message: d.issues[0] ?? "Needs review.",
        severity: (d.state === "broken" ? "error" : "warn") as "error" | "warn",
      })),
    ...report.orphans.map((orphan) => ({
      orgUnitId: Number(orphan.providerCourseId),
      courseName: orphan.title,
      message: orphan.reason,
      severity: "warn" as const,
    })),
  ];

  const status: SyncStatus = {
    lastRunAt: report.ranAt,
    coursesInBrightspace: report.coursesInBrightspace,
    coursesInSupabase: report.coursesInSupabase,
    driftCount: report.broken + report.needsReview + report.orphans.length,
    warnings,
  };

  return { data: status, source: result.source, fetchedAt: result.fetchedAt };
}
