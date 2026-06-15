import "server-only";

import os from "os";
import { promises as fs } from "fs";
import path from "path";

import { emptyTopic, type CourseDraft, type DraftSummary } from "@/types/studio";

/* File-backed draft storage (course-drafts/*.json). Local-first:
   no database migration to run, nothing to babysit. Drafts are the canonical
   course content; exported HTML is a regenerable artifact.

   Vercel serverless functions cannot write back into the deployed app folder,
   so production uses /tmp as a stopgap until Course Studio drafts move to
   Supabase. Reads still include bundled/local drafts for compatibility. */

const BUNDLED_DRAFTS_DIR = path.join(process.cwd(), "course-drafts");

function writableDraftsDir() {
  if (process.env.COURSE_DRAFTS_DIR) return process.env.COURSE_DRAFTS_DIR;
  if (process.env.VERCEL) return path.join(os.tmpdir(), "brightspace-manager", "course-drafts");
  return BUNDLED_DRAFTS_DIR;
}

function readableDraftsDirs() {
  return Array.from(new Set([writableDraftsDir(), BUNDLED_DRAFTS_DIR]));
}

function validateDraftId(id: string) {
  /* ids are slugs we generate ourselves; reject anything path-like anyway */
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid draft id.");
}

function draftPath(dir: string, id: string) {
  validateDraftId(id);
  return path.join(dir, `${id}.json`);
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "untitled"
  );
}

export async function listDrafts(): Promise<DraftSummary[]> {
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

  return Array.from(draftsById.values())
      .map((d) => {
        const topics = d.modules.flatMap((m) => m.topics);
        return {
          id: d.id,
          courseTitle: d.courseTitle,
          topicCount: topics.length,
          totalMinutes: topics.reduce((sum, t) => sum + (t.minutes || 0), 0),
          updatedAt: d.updatedAt,
        };
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function readDraft(id: string): Promise<CourseDraft | null> {
  validateDraftId(id);
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

export async function writeDraft(draft: CourseDraft): Promise<CourseDraft> {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  const dir = writableDraftsDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(draftPath(dir, draft.id), JSON.stringify(next, null, 2), "utf8");
  return next;
}

/* Deletes a draft from the writable store. On Vercel only /tmp is writable,
   so a bundled-only draft can't be removed there — the same write-back
   limitation that applies to saves. Returns whether a file was removed. */
export async function deleteDraft(id: string): Promise<boolean> {
  validateDraftId(id);
  try {
    await fs.unlink(draftPath(writableDraftsDir(), id));
    return true;
  } catch {
    /* not present in the writable dir — nothing to remove */
    return false;
  }
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
