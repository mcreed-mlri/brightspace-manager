import "server-only";

import { existsSync } from "fs";
import { promises as fs } from "fs";
import path from "path";

import type { TemplateInfo } from "@/types/studio";

/* The wrapper template lives in the brightspace-courses repo — the single
   source of truth Marlana edits. The Studio reads it live so a wrapper update
   flows into every subsequent export without copying files.

   Two sources, same files:
   - Local disk (COURSE_TEMPLATE_DIR) — the primary machine, fast and offline.
   - GitHub raw (COURSE_TEMPLATE_URL) — for Vercel, which has no C:\ filesystem.
     Set it to the raw base URL of the Course-Template directory, e.g.
     https://raw.githubusercontent.com/mcreed-mlri/brightspace-course-demo/main/Course-Template
   When COURSE_TEMPLATE_URL is set it wins; otherwise we read from disk. */

const DEFAULT_TEMPLATE_DIR = "C:\\dev\\brightspace-courses\\Course-Template";

/* Files shipped verbatim into every generated package. Home/complete render
   themselves from course-config.js at runtime, so they need no generation. */
export const WRAPPER_FILES = ["course-nav.js", "course-style.css", "Home.html", "complete.html"];

function getTemplateUrl(): string | null {
  const url = process.env.COURSE_TEMPLATE_URL?.trim();
  return url ? url.replace(/\/+$/, "") : null;
}

export function getTemplateDir(): string {
  return process.env.COURSE_TEMPLATE_DIR || DEFAULT_TEMPLATE_DIR;
}

/* Human-readable label for the active source — a URL when remote, the disk
   path when local. Used by the Settings UI when the template can't be found. */
export function getTemplateSource(): string {
  return getTemplateUrl() ?? getTemplateDir();
}

export async function isTemplateAvailable(): Promise<boolean> {
  const url = getTemplateUrl();
  if (url) {
    const checks = await Promise.all(
      WRAPPER_FILES.map(async (name) => {
        try {
          const res = await fetch(`${url}/${name}`, { method: "HEAD" });
          return res.ok;
        } catch {
          return false;
        }
      }),
    );
    return checks.every(Boolean);
  }
  return WRAPPER_FILES.every((name) => existsSync(path.join(getTemplateDir(), name)));
}

export async function getTemplateInfo(): Promise<TemplateInfo> {
  const dir = getTemplateSource();
  if (!(await isTemplateAvailable())) {
    return { available: false, dir, files: [] };
  }

  const url = getTemplateUrl();
  if (url) {
    const files = await Promise.all(
      WRAPPER_FILES.map(async (name) => {
        const res = await fetch(`${url}/${name}`);
        const body = await res.text();
        const lastModified = res.headers.get("last-modified");
        return {
          name,
          sizeBytes: Buffer.byteLength(body, "utf8"),
          modifiedAt: lastModified ? new Date(lastModified).toISOString() : "",
        };
      }),
    );
    return { available: true, dir, files };
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
  const url = getTemplateUrl();
  if (url) {
    const res = await fetch(`${url}/${name}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch wrapper file ${name}: ${res.status}`);
    }
    return res.text();
  }
  return fs.readFile(path.join(getTemplateDir(), name), "utf8");
}
