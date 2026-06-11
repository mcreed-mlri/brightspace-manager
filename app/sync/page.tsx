import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { SyncReportView } from "@/components/sync/sync-report-view";
import { runSyncCheck } from "@/lib/data/sync";

export const dynamic = "force-dynamic";

export default async function SyncPage() {
  const result = await runSyncCheck();

  return (
    <>
      <PageHeader
        title="Sync Diagnostics"
        description="Compares Brightspace course offerings against the Supabase learning_items cache and flags drift, mismatches, and missing metadata."
      />
      {result.source === "mock" ? <MockDataBanner /> : null}
      <SyncReportView initialReport={result.data} initialSource={result.source} />
    </>
  );
}
