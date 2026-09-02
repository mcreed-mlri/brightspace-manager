import "server-only";

import { liveResult, mockResult } from "@/lib/data/envelope";
import { mockCurriculumMap } from "@/lib/fixtures/curriculum-map";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { CurriculumMap, DataResult } from "@/types/domain";

/* The whole map lives in one `curriculum_map` row (id = 'default'). Reads go
   through the service-role client, mirroring lib/data/learning-items.ts:
  live when Supabase is configured and the row exists, otherwise the bundled
  starter map so the page always renders. */

const ROW_ID = "default";

export async function getCurriculumMap(): Promise<DataResult<CurriculumMap>> {
  if (!isSupabaseConfigured()) {
    return mockResult(mockCurriculumMap, "Curriculum Map");
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("curriculum_map")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();

    /* No row yet (first run) or a query error → fall back to the starter map.
       The first Save writes it, after which this returns live. */
    if (error || !data?.data) return mockResult(mockCurriculumMap, "Curriculum Map");
    return liveResult(data.data as CurriculumMap);
  } catch {
    return mockResult(mockCurriculumMap, "Curriculum Map");
  }
}

/* Overwrites the single map row. Called only from the authenticated save route
   (see app/api/curriculum-map/route.ts). Last-write-wins by design. */
export async function saveCurriculumMap(map: CurriculumMap, actor?: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("curriculum_map").upsert(
    {
      id: ROW_ID,
      data: map,
      updated_at: new Date().toISOString(),
      updated_by: actor ?? null,
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);
}
