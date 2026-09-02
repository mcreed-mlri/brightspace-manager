import "server-only";

import { liveResult, mockResult } from "@/lib/data/envelope";
import { mockLearningItems } from "@/lib/fixtures/learning-items";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { DataResult, LearningItemRow } from "@/types/domain";

/* Read-only listing of learning_items: live when Supabase is configured,
   mock fixtures otherwise. Falls back to mock on query errors so the UI
   keeps working — the health check on Settings surfaces the real failure. */
export async function listLearningItems(): Promise<DataResult<LearningItemRow[]>> {
  if (!isSupabaseConfigured()) {
    return mockResult(mockLearningItems, "Supabase learning_items");
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("learning_items")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) return mockResult(mockLearningItems, "Supabase learning_items");
    return liveResult((data ?? []) as LearningItemRow[]);
  } catch {
    return mockResult(mockLearningItems, "Supabase learning_items");
  }
}
