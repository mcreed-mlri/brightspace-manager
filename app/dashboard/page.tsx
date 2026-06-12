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

const HEALTH_LABEL: Record<HealthStatus["status"], string> = {
  ok: "connected",
  error: "error",
  unconfigured: "mock mode",
};

const DOT_COLOR: Record<BadgeTone, string> = {
  ok: "bg-status-ok",
  warn: "bg-status-warn",
  error: "bg-status-error",
  neutral: "bg-status-neutral",
  info: "bg-status-info",
};

function ConnectionCard({
  name,
  meta,
  tone,
  badge,
}: {
  name: string;
  meta: string;
  tone: BadgeTone;
  badge: string;
}) {
  return (
    <div className="editorial-card px-[18px] py-4">
      <p className="mb-0.5 text-[13.5px] font-bold text-ink">{name}</p>
      <p className="font-mono text-xs text-ink-soft">{meta}</p>
      <div className="mt-2.5 flex items-center gap-[7px]">
        <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[tone]}`} aria-hidden />
        <StatusBadge tone={tone}>{badge}</StatusBadge>
      </div>
    </div>
  );
}

function countRecentlyUpdated(courses: CourseOffering[]): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return courses.filter((c) => c.lastSyncedAt && new Date(c.lastSyncedAt).getTime() > cutoff)
    .length;
}

export default async function OperatorDashboardPage() {
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
  const syncTone: BadgeTone = sync.driftCount > 0 ? "warn" : "ok";

  return (
    <div className="max-w-[920px]">
      <PageHeader
        title="Dashboard"
        description="Operational overview of Brightspace course offerings, connection health, and the Supabase cache."
      />
      {isMock ? <MockDataBanner /> : null}

      <div className="mb-[22px] grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <ConnectionCard
          name="Brightspace"
          meta={`checked ${formatRelative(bsHealth.checkedAt)}`}
          tone={HEALTH_TONE[bsHealth.status]}
          badge={HEALTH_LABEL[bsHealth.status]}
        />
        <ConnectionCard
          name="Supabase"
          meta={`checked ${formatRelative(sbHealth.checkedAt)}`}
          tone={HEALTH_TONE[sbHealth.status]}
          badge={HEALTH_LABEL[sbHealth.status]}
        />
        <ConnectionCard
          name="Sync"
          meta={sync.lastRunAt ? `last run ${formatRelative(sync.lastRunAt)}` : "has not run yet"}
          tone={syncTone}
          badge={sync.driftCount > 0 ? `${sync.driftCount} drift` : "in sync"}
        />
      </div>

      <div className="mb-[22px] grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active Offerings"
          value={active.length}
          sub="Courses learners can reach"
        />
        <MetricCard
          label="Recently Updated"
          value={recentlyUpdated}
          sub="Synced within the last 7 days"
        />
        <MetricCard
          label="Archived"
          value={archived.length}
          sub="Retired offerings (kept, not deleted)"
        />
        <MetricCard
          label="Sync Drift"
          value={sync.driftCount}
          sub={`${sync.coursesInBrightspace} BS / ${sync.coursesInSupabase} SB`}
          warn={sync.driftCount > 0}
          badge={
            sync.driftCount > 0 ? <StatusBadge tone="warn">review</StatusBadge> : undefined
          }
        />
        <MetricCard
          label="Warnings"
          value={sync.warnings.length}
          sub="Open items from the last sync check"
          warn={sync.warnings.length > 0}
          badge={
            sync.warnings.length > 0 ? (
              <StatusBadge tone="warn">needs review</StatusBadge>
            ) : undefined
          }
        />
      </div>

      <p className="section-title mb-2.5 text-ink">Needs attention</p>
      {sync.warnings.length === 0 && needsAttention.length === 0 ? (
        <p className="text-sm text-ink-muted">Nothing needs attention right now.</p>
      ) : (
        <div className="editorial-card divide-y divide-line-soft">
          {sync.warnings.map((warning, index) => (
            <div key={`${warning.orgUnitId}-${index}`} className="flex items-center gap-3 px-5 py-[13px]">
              <StatusBadge tone={warning.severity === "error" ? "error" : "warn"}>
                {warning.severity === "error" ? "broken" : "review"}
              </StatusBadge>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-ink">{warning.courseName}</p>
                <p className="text-[12.5px] text-ink-muted">{warning.message}</p>
              </div>
              <Link
                href="/courses/"
                className="ml-auto font-mono text-xs font-semibold text-brand"
              >
                {warning.orgUnitId} →
              </Link>
            </div>
          ))}
          {needsAttention.map((course) => (
            <div key={course.orgUnitId} className="flex items-center gap-3 px-5 py-[13px]">
              <StatusBadge tone="warn">metadata</StatusBadge>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-ink">{course.name}</p>
                <p className="text-[12.5px] text-ink-muted">
                  Missing {missingMetadata(course).join(", ")}
                </p>
              </div>
              <Link
                href="/courses/"
                className="ml-auto font-mono text-xs font-semibold text-brand"
              >
                {course.orgUnitId} →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
