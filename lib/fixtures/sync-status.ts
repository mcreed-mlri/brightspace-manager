import type { SyncStatus } from "@/types/domain";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/* Mock Brightspace ↔ Supabase sync snapshot. Numbers intentionally line up
   with lib/fixtures/courses.ts: 12 offerings in Brightspace, 2 of which have
   never synced or gone stale enough to count as drift. */
export const mockSyncStatus: SyncStatus = {
  lastRunAt: hoursAgo(4),
  coursesInBrightspace: 12,
  coursesInSupabase: 10,
  driftCount: 2,
  warnings: [
    {
      orgUnitId: 6707,
      courseName: "Blank-Course",
      message: "Exists in Brightspace but has never synced to Supabase.",
      severity: "warn",
    },
    {
      orgUnitId: 6721,
      courseName: "Emergency Assistance Shelter Advocacy",
      message: "Last synced 40 days ago — cache may be stale.",
      severity: "warn",
    },
    {
      orgUnitId: 6707,
      courseName: "Blank-Course",
      message: "Missing jurisdiction and program metadata.",
      severity: "error",
    },
  ],
};
