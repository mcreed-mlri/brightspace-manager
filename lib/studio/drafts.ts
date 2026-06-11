import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { emptyTopic, type CourseDraft, type DraftSummary } from "@/types/studio";

/* File-backed draft storage (course-drafts/*.json, gitignored). Local-first:
   no database migration to run, nothing to babysit. Drafts are the canonical
   course content; exported HTML is a regenerable artifact. */

function draftsDir() {
  return process.env.COURSE_DRAFTS_DIR || path.join(process.cwd(), "course-drafts");
}

function draftPath(id: string) {
  /* ids are slugs we generate ourselves; reject anything path-like anyway */
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid draft id.");
  return path.join(draftsDir(), `${id}.json`);
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
  try {
    const names = await fs.readdir(draftsDir());
    const drafts = await Promise.all(
      names
        .filter((n) => n.endsWith(".json"))
        .map(async (n) => {
          try {
            const raw = await fs.readFile(path.join(draftsDir(), n), "utf8");
            return JSON.parse(raw) as CourseDraft;
          } catch {
            return null;
          }
        }),
    );
    return drafts
      .filter((d): d is CourseDraft => d !== null)
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
  } catch {
    return [];
  }
}

export async function readDraft(id: string): Promise<CourseDraft | null> {
  try {
    const raw = await fs.readFile(draftPath(id), "utf8");
    return JSON.parse(raw) as CourseDraft;
  } catch {
    return null;
  }
}

export async function writeDraft(draft: CourseDraft): Promise<CourseDraft> {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  await fs.mkdir(draftsDir(), { recursive: true });
  await fs.writeFile(draftPath(draft.id), JSON.stringify(next, null, 2), "utf8");
  return next;
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
