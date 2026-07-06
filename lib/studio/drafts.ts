import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { isDeployReady } from "@/lib/studio/deploy";
import { deleteAllImages } from "@/lib/studio/images";
import { readableDraftsDirs, validateDraftId, writableDraftsDir } from "@/lib/studio/paths";
import { slugify } from "@/lib/studio/slug";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { emptyTopic, type CourseDraft, type DraftSummary } from "@/types/studio";

export { slugify };

/* Draft storage with two backends behind one set of functions:

   - Supabase (course_drafts table) whenever the service-role env vars are
     set — durable on Vercel, one row per draft, whole document as JSONB.
     Run scripts/setup-course-drafts.sql once, then `npm run import-drafts`.
   - Local JSON files (course-drafts/*.json) otherwise — no database to run,
     which keeps local dev working with zero env. Directory logic (including
     the Vercel /tmp stopgap) lives in lib/studio/paths.ts.

   When Supabase is active, bundled JSON drafts that aren't in the table yet
   still appear in lists (table rows win by id) — nothing disappears before
   the one-time import; saving one promotes it into the table.

   Until scripts/setup-course-drafts.sql has been run, the table doesn't
   exist (Postgres error 42P01) — every function quietly falls back to the
   file backend so having Supabase keys alone never breaks the Studio. */

const TABLE = "course_drafts";

function isMissingTable(error: { code?: string }): boolean {
  return error.code === "42P01";
}

function draftPath(dir: string, id: string) {
  validateDraftId(id);
  return path.join(dir, `${id}.json`);
}

async function listFileDrafts(): Promise<Map<string, CourseDraft>> {
  const draftsById = new Map<string, CourseDraft>();
  for (const dir of readableDraftsDirs()) {
    try {
      const names = await fs.readdir(dir);
      const drafts = await Promise.all(
        names
          .filter((n) => n.endsWith(".json"))
          .map(async (n) => {
            try {
              const raw = await fs.readFile(path.join(dir, n), "utf8");
              return JSON.parse(raw) as CourseDraft;
            } catch {
              return null;
            }
          }),
      );
      for (const draft of drafts) {
        if (draft && !draftsById.has(draft.id)) draftsById.set(draft.id, draft);
      }
    } catch {
      /* Missing draft folders are fine in fresh deployments. */
    }
  }
  return draftsById;
}

function toSummary(d: CourseDraft): DraftSummary {
  const topics = d.modules.flatMap((m) => m.topics);
  return {
    id: d.id,
    courseTitle: d.courseTitle,
    topicCount: topics.length,
    totalMinutes: topics.reduce((sum, t) => sum + (t.minutes || 0), 0),
    updatedAt: d.updatedAt,
    deployReady: isDeployReady(d),
  };
}

export async function listDrafts(): Promise<DraftSummary[]> {
  const draftsById = await listFileDrafts();

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from(TABLE).select("data");
    if (error && !isMissingTable(error)) throw new Error(error.message);
    for (const row of data ?? []) {
      const draft = row.data as CourseDraft;
      draftsById.set(draft.id, draft);
    }
  }

  return Array.from(draftsById.values())
    .map(toSummary)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function readDraft(id: string): Promise<CourseDraft | null> {
  validateDraftId(id);

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from(TABLE).select("data").eq("id", id).maybeSingle();
    if (error && !isMissingTable(error)) throw new Error(error.message);
    if (data?.data) return data.data as CourseDraft;
    /* fall through: bundled JSON drafts stay readable before the import */
  }

  for (const dir of readableDraftsDirs()) {
    try {
      const raw = await fs.readFile(draftPath(dir, id), "utf8");
      return JSON.parse(raw) as CourseDraft;
    } catch {
      /* Try the next readable draft location. */
    }
  }
  return null;
}

export async function writeDraft(draft: CourseDraft, updatedBy?: string): Promise<CourseDraft> {
  const next = { ...draft, updatedAt: new Date().toISOString() };

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from(TABLE).upsert(
      {
        id: next.id,
        data: next,
        course_title: next.courseTitle,
        deploy_ready: isDeployReady(next),
        updated_at: next.updatedAt,
        updated_by: updatedBy ?? null,
      },
      { onConflict: "id" },
    );
    if (!error) return next;
    if (!isMissingTable(error)) throw new Error(error.message);
    /* table not created yet — fall through to the file write */
  }

  const dir = writableDraftsDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(draftPath(dir, draft.id), JSON.stringify(next, null, 2), "utf8");
  return next;
}

/* Deletes a draft (and its images) from the active backend. A bundled JSON
   draft committed to the repo can't be removed on Vercel — the same
   limitation the file backend always had. Returns whether anything was
   removed. */
export async function deleteDraft(id: string): Promise<boolean> {
  validateDraftId(id);
  await deleteAllImages(id);

  let removed = false;
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id");
    if (error && !isMissingTable(error)) throw new Error(error.message);
    removed = (data?.length ?? 0) > 0;
  }

  try {
    await fs.unlink(draftPath(writableDraftsDir(), id));
    removed = true;
  } catch {
    /* not present in the writable dir — nothing to remove */
  }
  return removed;
}

export async function createDraft(courseTitle: string): Promise<CourseDraft> {
  const base = slugify(courseTitle);
  let id = base;
  for (let n = 2; (await readDraft(id)) !== null; n++) {
    id = `${base}-${n}`;
  }

  const now = new Date().toISOString();
  const draft: CourseDraft = {
    id,
    createdAt: now,
    updatedAt: now,
    courseId: id,
    courseTitle,
    courseSubtitle: "",
    courseBlurb: "",
    courseArea: "",
    topic: "foundations",
    chromeMode: "bar",
    homeLinkUrl: "https://lms-discovery.vercel.app/",
    modules: [
      {
        id: "module-1",
        title: courseTitle,
        description: "",
        topics: [emptyTopic("topic-1", "First topic")],
      },
    ],
  };
  return writeDraft(draft);
}
