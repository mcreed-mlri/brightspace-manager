import "server-only";

import { existsSync } from "fs";
import { promises as fs } from "fs";
import path from "path";

import type { TemplateInfo } from "@/types/studio";

/* The wrapper template lives in the brightspace-courses repo — the single
   source of truth Marlana edits. The Studio reads it at export time so a
   wrapper update flows into every subsequent export without copying files. */

const DEFAULT_TEMPLATE_DIR = "C:\\dev\\brightspace-courses\\Course-Template";

/* Files shipped verbatim into every generated package. Home/complete render
   themselves from course-config.js at runtime, so they need no generation. */
export const WRAPPER_FILES = ["course-nav.js", "course-style.css", "Home.html", "complete.html"];

export function getTemplateDir(): string {
  return process.env.COURSE_TEMPLATE_DIR || DEFAULT_TEMPLATE_DIR;
}

export function isTemplateAvailable(): boolean {
  return WRAPPER_FILES.every((name) => existsSync(path.join(getTemplateDir(), name)));
}

export async function getTemplateInfo(): Promise<TemplateInfo> {
  const dir = getTemplateDir();
  if (!isTemplateAvailable()) {
    return { available: false, dir, files: [] };
  }
  const files = await Promise.all(
    WRAPPER_FILES.map(async (name) => {
      const stat = await fs.stat(path.join(dir, name));
      return { name, sizeBytes: stat.size, modifiedAt: stat.mtime.toISOString() };
    }),
  );
  return { available: true, dir, files };
}

export async function readWrapperFile(name: string): Promise<string> {
  if (!WRAPPER_FILES.includes(name)) {
    throw new Error(`Not a wrapper file: ${name}`);
  }
  return fs.readFile(path.join(getTemplateDir(), name), "utf8");
}
