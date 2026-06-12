import "server-only";

import { appendAuditEntry } from "@/lib/audit";
import { isBrightspaceLive } from "@/lib/brightspace/config";
import { listCourseOfferings } from "@/lib/data/courses";
import { listLearningItems } from "@/lib/data/learning-items";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { CourseOffering, LearningItemRow, SyncPlan, SyncPlanItem, SyncRunResult } from "@/types/domain";

/* The first write action in the app. Governance rules baked in:
     · plan first — the preview is computed server-side and shown to the admin
     · execute recomputes the plan (never trusts a client payload)
     · upsert only — rows whose Brightspace course vanished are LEFT ALONE
       (archive-don't-delete; they surface as orphans in diagnostics)
     · every run is appended to the audit log */

export function canSyncWrite(): boolean {
  return isBrightspaceLive() && isSupabaseConfigured();
}

type UpsertRow = {
  provider: string;
  provider_course_id: string;
  item_type: string;
  title: string;
  practice_area: string | null;
  brightspace_url: string;
  metadata: Record<string, unknown>;
  synced_at: string;
};

function toUpsertRow(course: CourseOffering, now: string): UpsertRow {
  return {
    provider: "brightspace",
    provider_course_id: String(course.orgUnitId),
    item_type: "course",
    title: course.name,
    practice_area: course.program,
    brightspace_url: course.brightspaceUrl,
    metadata: {
      code: course.code,
      jurisdiction: course.jurisdiction,
      program: course.program,
      is_active: course.isActive,
    },
    synced_at: now,
  };
}

function diffChanges(course: CourseOffering, item: LearningItemRow): string[] {
  const changes: string[] = [];
  if (item.title.trim() !== course.name.trim()) {
    changes.push(`title: "${item.title}" → "${course.name}"`);
  }
  if ((item.practice_area ?? null) !== (course.program ?? null)) {
    changes.push(`practice_area: ${item.practice_area ?? "—"} → ${course.program ?? "—"}`);
  }
  if ((item.brightspace_url ?? "") !== course.brightspaceUrl) {
    changes.push("brightspace_url updated");
  }
  const meta = (item.metadata ?? {}) as Record<string, unknown>;
  if (meta.is_active !== course.isActive) {
    changes.push(`active flag: ${String(meta.is_active ?? "unset")} → ${String(course.isActive)}`);
  }
  if ((meta.jurisdiction ?? null) !== (course.jurisdiction ?? null)) {
    changes.push(`jurisdiction: ${String(meta.jurisdiction ?? "—")} → ${course.jurisdiction ?? "—"}`);
  }
  return changes;
}

export async function buildSyncPlan(): Promise<SyncPlan> {
  const [courses, items] = await Promise.all([listCourseOfferings(), listLearningItems()]);
  if (courses.source !== "live" || items.source !== "live") {
    throw new Error("Sync requires live Brightspace and Supabase connections.");
  }

  const itemsByCourseId = new Map(
    items.data
      .filter((item) => item.provider_course_id)
      .map((item) => [item.provider_course_id as string, item]),
  );
  const knownCourseIds = new Set(courses.data.map((c) => String(c.orgUnitId)));

  const toCreate: SyncPlanItem[] = [];
  const toUpdate: SyncPlanItem[] = [];
  let unchanged = 0;

  for (const course of courses.data) {
    const existing = itemsByCourseId.get(String(course.orgUnitId));
    if (!existing) {
      toCreate.push({
        orgUnitId: course.orgUnitId,
        name: course.name,
        action: "create",
        changes: ["new learning_items row"],
      });
      continue;
    }
    const changes = diffChanges(course, existing);
    if (changes.length > 0) {
      toUpdate.push({ orgUnitId: course.orgUnitId, name: course.name, action: "update", changes });
    } else {
      unchanged++;
    }
  }

  const orphansLeftAlone = items.data.filter(
    (item) => item.provider_course_id && !knownCourseIds.has(item.provider_course_id),
  ).length;

  return { builtAt: new Date().toISOString(), toCreate, toUpdate, unchanged, orphansLeftAlone };
}

export async function executeSyncPlan(actor?: string): Promise<SyncRunResult> {
  /* Recompute server-side at execution time — the preview the admin saw may
     be stale, but what executes is always the current truth. */
  const plan = await buildSyncPlan();
  const courses = await listCourseOfferings();
  const now = new Date().toISOString();

  const pendingIds = new Set([...plan.toCreate, ...plan.toUpdate].map((p) => String(p.orgUnitId)));
  const rows = courses.data
    .filter((c) => pendingIds.has(String(c.orgUnitId)))
    .map((c) => toUpsertRow(c, now));

  const result: SyncRunResult = {
    ranAt: now,
    created: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  if (rows.length > 0) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("learning_items")
      .upsert(rows, { onConflict: "provider_course_id" });

    if (error) {
      result.failed = rows.length;
      result.errors.push(error.message);
    } else {
      result.created = plan.toCreate.length;
      result.updated = plan.toUpdate.length;
    }
  }

  await appendAuditEntry({
    ranAt: result.ranAt,
    created: result.created,
    updated: result.updated,
    failed: result.failed,
    ...(actor ? { actor } : {}),
  });

  return result;
}
