import "server-only";

import {
  brightspaceApiFetch,
  brightspacePagedGet,
  getBrightspaceBaseUrl,
  lpPath,
} from "@/lib/brightspace/api";
import { isBrightspaceLive } from "@/lib/brightspace/config";
import { liveResult, mockResult } from "@/lib/data/envelope";
import { listLearningItems } from "@/lib/data/learning-items";
import { mockCourseOfferings } from "@/lib/fixtures/courses";
import type { CourseOffering, DataResult, SyncState } from "@/types/domain";

/* D2L's built-in org unit type ID for Course Offering is 3; the MLRI tenant
   defines custom types State=103 and Program=101 (see /outypes/). All
   configurable in case the tenant changes. */
const COURSE_OFFERING_TYPE_ID = Number(process.env.BRIGHTSPACE_COURSE_OFFERING_TYPE_ID || 3);
const STATE_TYPE_ID = Number(process.env.BRIGHTSPACE_STATE_TYPE_ID || 103);
const PROGRAM_TYPE_ID = Number(process.env.BRIGHTSPACE_PROGRAM_TYPE_ID || 101);
const STALE_AFTER_DAYS = 30;
const DETAIL_CONCURRENCY = 5;

type OrgStructureItem = {
  Identifier: string;
  Name: string;
  Code: string | null;
  Type: { Id: number; Code: string; Name: string };
};

type CourseDetail = {
  IsActive?: boolean;
};

function computeSyncState(syncedAt: string | null): SyncState {
  if (!syncedAt) return "never-synced";
  const ms = Date.parse(syncedAt);
  if (!Number.isFinite(ms)) return "unknown";
  return Date.now() - ms > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000 ? "stale" : "synced";
}

/* Jurisdiction/program from org structure ancestors. The MLRI hierarchy is
   Org → State (103) → Training Area (105) → Program (101) → Course Template
   → Course Offering. Match on type ID first, type name as fallback. */
function classifyAncestors(ancestors: OrgStructureItem[]) {
  let jurisdiction: string | null = null;
  let program: string | null = null;
  for (const ancestor of ancestors) {
    const typeId = ancestor.Type?.Id;
    const typeName = `${ancestor.Type?.Name ?? ""} ${ancestor.Type?.Code ?? ""}`.toLowerCase();
    if (
      !jurisdiction &&
      (typeId === STATE_TYPE_ID || typeName.includes("state") || typeName.includes("jurisdiction"))
    ) {
      jurisdiction = ancestor.Name;
    }
    if (!program && (typeId === PROGRAM_TYPE_ID || typeName.includes("program"))) {
      program = ancestor.Name;
    }
  }
  return { jurisdiction, program };
}

async function fetchLiveCourseOfferings(): Promise<CourseOffering[]> {
  const baseUrl = getBrightspaceBaseUrl() as string;

  const [orgUnits, items] = await Promise.all([
    brightspacePagedGet<OrgStructureItem>(
      lpPath(`/orgstructure/?orgUnitType=${COURSE_OFFERING_TYPE_ID}`),
    ),
    listLearningItems(),
  ]);

  const syncedByCourseId = new Map(
    items.data
      .filter((item) => item.provider_course_id)
      .map((item) => [item.provider_course_id as string, item.synced_at]),
  );

  const queue = [...orgUnits];
  const results: CourseOffering[] = [];

  async function worker() {
    for (let unit = queue.shift(); unit; unit = queue.shift()) {
      const orgUnitId = Number(unit.Identifier);

      /* Detail + ancestry reads are best-effort; a failure on one course
         shouldn't sink the whole inventory. */
      let isActive = true;
      try {
        const response = await brightspaceApiFetch(lpPath(`/courses/${orgUnitId}`));
        if (response.ok) {
          const detail = (await response.json()) as CourseDetail;
          isActive = Boolean(detail.IsActive);
        }
      } catch {
        /* keep default */
      }

      let jurisdiction: string | null = null;
      let program: string | null = null;
      try {
        const response = await brightspaceApiFetch(lpPath(`/orgstructure/${orgUnitId}/ancestors/`));
        if (response.ok) {
          const ancestors = (await response.json()) as OrgStructureItem[];
          ({ jurisdiction, program } = classifyAncestors(ancestors));
        }
      } catch {
        /* keep nulls — flagged as missing metadata, which is honest */
      }

      const lastSyncedAt = syncedByCourseId.get(String(orgUnitId)) ?? null;
      results.push({
        orgUnitId,
        name: unit.Name,
        code: unit.Code ?? "",
        jurisdiction,
        program,
        isActive,
        lastSyncedAt,
        syncState: computeSyncState(lastSyncedAt),
        brightspaceUrl: `${baseUrl}/d2l/home/${orgUnitId}`,
      });
    }
  }

  await Promise.all(Array.from({ length: DETAIL_CONCURRENCY }, worker));
  results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}

export async function listCourseOfferings(): Promise<DataResult<CourseOffering[]>> {
  if (!isBrightspaceLive()) {
    return mockResult(mockCourseOfferings);
  }

  try {
    return liveResult(await fetchLiveCourseOfferings());
  } catch (error) {
    /* Surface the failure in server logs; the UI falls back to mock with the
       banner visible, and Settings' health check shows the real error. */
    console.error("[brightspace] live course listing failed:", error);
    return mockResult(mockCourseOfferings);
  }
}

export async function getCourseOffering(
  orgUnitId: number,
): Promise<DataResult<CourseOffering | null>> {
  const all = await listCourseOfferings();
  return { ...all, data: all.data.find((c) => c.orgUnitId === orgUnitId) ?? null };
}
