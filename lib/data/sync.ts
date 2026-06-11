import "server-only";

import { mockResult } from "@/lib/data/envelope";
import { mockSyncStatus } from "@/lib/fixtures/sync-status";
import type { DataResult, SyncStatus } from "@/types/domain";

export async function getSyncStatus(): Promise<DataResult<SyncStatus>> {
  /* LIVE (later milestone): diff Brightspace course offerings against
     Supabase learning_items and compute drift + warnings server-side. */
  return mockResult(mockSyncStatus);
}
