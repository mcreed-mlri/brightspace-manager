import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import { listCourseOfferings } from "@/lib/data/courses";
import { checkBrightspaceHealth, checkSupabaseHealth } from "@/lib/data/health";
import { getSyncStatus } from "@/lib/data/sync";
import { missingMetadata, type CourseOffering, type HealthStatus } from "@/types/domain";
import { formatRelative } from "@/components/courses/course-presentation";

export const dynamic = "force-dynamic";

const HEALTH_TONE: Record<HealthStatus["status"], BadgeTone> = {
  ok: "ok",
  error: "error",
  unconfigured: "neutral",
};

function countRecentlyUpdated(courses: CourseOffering[]): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return courses.filter((c) => c.lastSyncedAt && new Date(c.lastSyncedAt).getTime() > cutoff)
    .length;
}

export default async function DashboardPage() {
  const [coursesResult, syncResult, bsHealth, sbHealth] = await Promise.all([
    listCourseOfferings(),
    getSyncStatus(),
    checkBrightspaceHealth(),
    checkSupabaseHealth(),
  ]);

  const courses = coursesResult.data;
  const sync = syncResult.data;
  const isMock = coursesResult.source === "mock" || syncResult.source === "mock";

  const active = courses.filter((c) => c.isActive);
  const archived = courses.filter((c) => !c.isActive);
  const recentlyUpdated = countRecentlyUpdated(courses);
  const needsAttention = courses.filter((c) => missingMetadata(c).length > 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Operational overview of Brightspace course offerings and the Supabase cache."
      />
      {isMock ? <MockDataBanner /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Active offerings"
          value={active.length}
          sub="Course offerings learners can reach"
        />
        <MetricCard
          label="Recently updated"
          value={recentlyUpdated}
          sub="Synced within the last 7 days"
        />
        <MetricCard label="Archived" value={archived.length} sub="Retired offerings (kept, not deleted)" />
        <MetricCard
          label="Sync drift"
          value={sync.driftCount}
          sub={
            sync.lastRunAt
              ? `Last sync check ${formatRelative(sync.lastRunAt)}`
              : "Sync has not run yet"
          }
          badge={
            <StatusBadge tone={sync.driftCount > 0 ? "warn" : "ok"}>
              {sync.coursesInBrightspace} BS / {sync.coursesInSupabase} SB
            </StatusBadge>
          }
        />
        <MetricCard
          label="API health"
          value={
            <span className="flex flex-wrap items-center gap-2 text-sm font-normal">
              <StatusBadge tone={HEALTH_TONE[bsHealth.status]}>
                Brightspace · {bsHealth.status}
              </StatusBadge>
              <StatusBadge tone={HEALTH_TONE[sbHealth.status]}>
                Supabase · {sbHealth.status}
              </StatusBadge>
            </span>
          }
          sub="Connection details live in Settings"
        />
        <MetricCard
          label="Warnings"
          value={sync.warnings.length}
          sub="Open items from the last sync check"
          badge={
            sync.warnings.length > 0 ? <StatusBadge tone="warn">needs review</StatusBadge> : undefined
          }
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-ink">Needs attention</h2>
        {sync.warnings.length === 0 && needsAttention.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing needs attention right now.</p>
        ) : (
          <div className="editorial-card divide-y divide-line-soft">
            {sync.warnings.map((warning, index) => (
              <div key={`${warning.orgUnitId}-${index}`} className="flex items-center gap-3 px-5 py-3">
                <StatusBadge tone={warning.severity === "error" ? "error" : "warn"}>
                  {warning.severity === "error" ? "broken" : "review"}
                </StatusBadge>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{warning.courseName}</p>
                  <p className="text-xs text-ink-muted">{warning.message}</p>
                </div>
                <span className="ml-auto font-mono text-xs text-ink-soft">{warning.orgUnitId}</span>
              </div>
            ))}
            {needsAttention.map((course) => (
              <div key={course.orgUnitId} className="flex items-center gap-3 px-5 py-3">
                <StatusBadge tone="warn">metadata</StatusBadge>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{course.name}</p>
                  <p className="text-xs text-ink-muted">
                    Missing {missingMetadata(course).join(", ")}
                  </p>
                </div>
                <Link
                  href="/courses/"
                  className="ml-auto text-xs font-medium text-brand underline-offset-2 hover:underline"
                >
                  View in inventory
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
