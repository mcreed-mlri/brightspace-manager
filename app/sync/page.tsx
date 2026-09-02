import { LiveDataRequiredPanel } from "@/components/live-data-required-panel";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { SyncReportView } from "@/components/sync/sync-report-view";
import { SyncWritePanel } from "@/components/sync/sync-write-panel";
import { readRecentAuditEntries } from "@/lib/audit";
import { isMockDataDisabledError } from "@/lib/data/mode";
import { canSyncWrite } from "@/lib/data/sync-write";
import { runSyncCheck } from "@/lib/data/sync";

export const dynamic = "force-dynamic";

export default async function SyncPage() {
  let result: Awaited<ReturnType<typeof runSyncCheck>>;
  let recentRuns: Awaited<ReturnType<typeof readRecentAuditEntries>>;
  try {
    [result, recentRuns] = await Promise.all([runSyncCheck(), readRecentAuditEntries(5)]);
  } catch (error) {
    if (!isMockDataDisabledError(error)) throw error;
    recentRuns = await readRecentAuditEntries(5);
    return (
      <>
        <PageHeader
          eyebrow="Monitor · Sync"
          title="Sync Diagnostics"
          description="Compares Brightspace course offerings against the Supabase learning_items cache and flags drift, mismatches, and missing metadata."
        />
        <LiveDataRequiredPanel message={error.message} />
        <SyncWritePanel canWrite={canSyncWrite()} recentRuns={recentRuns} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Monitor · Sync"
        title="Sync Diagnostics"
        description="Compares Brightspace course offerings against the Supabase learning_items cache and flags drift, mismatches, and missing metadata."
      />
      {result.source === "mock" ? <MockDataBanner /> : null}
      <SyncReportView initialReport={result.data} initialSource={result.source} />
      <SyncWritePanel canWrite={canSyncWrite()} recentRuns={recentRuns} />
    </>
  );
}
