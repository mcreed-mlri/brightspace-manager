import "server-only";

import { isBrightspaceLive } from "@/lib/brightspace/config";
import { mockResult } from "@/lib/data/envelope";
import { mockCourseOfferings } from "@/lib/fixtures/courses";
import type { CourseOffering, DataResult } from "@/types/domain";

/* Template for the mock→live swap used by every data module: check config,
   return fixtures when the live path isn't available yet. */
export async function listCourseOfferings(): Promise<DataResult<CourseOffering[]>> {
  if (!isBrightspaceLive()) {
    return mockResult(mockCourseOfferings);
  }
  /* LIVE (later milestone):
     GET lpPath(`/orgstructure/?orgUnitType={courseOfferingTypeId}`) with
     bookmark-based PagedResultSet pagination, then enrich each offering with
     Supabase learning_items.synced_at keyed on provider_course_id.
     Until that lands, live mode still serves fixtures so the UI keeps
     working with a visible mock badge. */
  return mockResult(mockCourseOfferings);
}

export async function getCourseOffering(orgUnitId: number): Promise<DataResult<CourseOffering | null>> {
  const all = await listCourseOfferings();
  return { ...all, data: all.data.find((c) => c.orgUnitId === orgUnitId) ?? null };
}
