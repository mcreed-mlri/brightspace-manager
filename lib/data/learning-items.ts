import "server-only";

import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { LearningItemRow } from "@/types/domain";

/* Read-only preview of the live learning_items table. Returns null when
   Supabase isn't configured — the page shows its placeholder instead. */
export async function previewLearningItems(limit = 10): Promise<LearningItemRow[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("learning_items")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) return null;
    return (data ?? []) as LearningItemRow[];
  } catch {
    return null;
  }
}
