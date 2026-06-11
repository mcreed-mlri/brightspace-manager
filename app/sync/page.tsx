import { MetricCard } from "@/components/metric-card";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getSyncStatus } from "@/lib/data/sync";
import { formatRelative } from "@/components/courses/course-presentation";

export const dynamic = "force-dynamic";

export default async function SyncPage() {
  const result = await getSyncStatus();
  const sync = result.data;

  return (
    <>
      <PageHeader
        title="Sync Diagnostics"
        description="Compares Brightspace course offerings against the Supabase cache and flags drift. Full diffing arrives in a later milestone — this is a preview of the report shape."
      />
      {result.source === "mock" ? <MockDataBanner /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="In Brightspace" value={sync.coursesInBrightspace} sub="Course offerings (system of record)" />
        <MetricCard label="In Supabase" value={sync.coursesInSupabase} sub="learning_items cache rows" />
        <MetricCard
          label="Drift"
          value={sync.driftCount}
          sub={sync.lastRunAt ? `Last checked ${formatRelative(sync.lastRunAt)}` : "Never checked"}
          badge={
            <StatusBadge tone={sync.driftCount > 0 ? "warn" : "ok"}>
              {sync.driftCount > 0 ? "needs review" : "healthy"}
            </StatusBadge>
          }
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-ink">Warnings</h2>
        {sync.warnings.length === 0 ? (
          <p className="text-sm text-ink-muted">No sync warnings.</p>
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
          </div>
        )}
      </section>

      <p className="mt-6 text-xs text-ink-soft">
        A &ldquo;Run Sync Check&rdquo; action will land here once the live Brightspace ↔ Supabase
        diff is built. All sync runs will be logged.
      </p>
    </>
  );
}
