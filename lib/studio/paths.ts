import "server-only";

import os from "os";
import path from "path";

/* Where Studio drafts (and their images) live on disk — shared by the draft
   store and the image store so neither has to import the other.

   Vercel serverless functions cannot write back into the deployed app folder,
   so production uses /tmp as a stopgap until drafts move to Supabase. */

export const BUNDLED_DRAFTS_DIR = path.join(process.cwd(), "course-drafts");

export function writableDraftsDir() {
  if (process.env.COURSE_DRAFTS_DIR) return process.env.COURSE_DRAFTS_DIR;
  if (process.env.VERCEL) return path.join(os.tmpdir(), "brightspace-manager", "course-drafts");
  return BUNDLED_DRAFTS_DIR;
}

export function readableDraftsDirs() {
  return Array.from(new Set([writableDraftsDir(), BUNDLED_DRAFTS_DIR]));
}

export function validateDraftId(id: string) {
  /* ids are slugs we generate ourselves; reject anything path-like anyway */
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid draft id.");
}
