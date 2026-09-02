import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { readableDraftsDirs, validateDraftId, writableDraftsDir } from "@/lib/studio/paths";
import { slugify } from "@/lib/studio/slug";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";

/* Image store for Course Studio drafts, with the same two backends as the
   draft store (lib/studio/drafts.ts):

   - Supabase Storage (private bucket, objects at {draftId}/{filename})
     whenever the service-role env vars are set — durable on Vercel. The
     browser never touches the bucket; images stream through the app's
     authenticated image route.
   - Local files at course-drafts/{draftId}/images/{filename} otherwise —
     the draft list ignores folders (it only reads *.json), and the folder
     rides along in git like the drafts do.

   Never base64 in the draft JSON: that would bloat every autosave and undo
   snapshot. */

const BUCKET = "course-studio-images";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/* MIME type → canonical extension. No SVG on purpose — it can carry scripts,
   and these files are served to learners inside Brightspace. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function isValidImageFilename(name: string): boolean {
  return (
    /^[a-z0-9][a-z0-9._-]*$/i.test(name) &&
    !name.includes("..") &&
    ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase())
  );
}

export function contentTypeFor(filename: string): string {
  return CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
}

export function isAllowedImageBytes(mimeType: string, bytes: Buffer): boolean {
  if (mimeType === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (mimeType === "image/gif") {
    const signature = bytes.subarray(0, 6).toString("ascii");
    return signature === "GIF87a" || signature === "GIF89a";
  }
  return false;
}

/* "Notice Timeline (v2).PNG" → "notice-timeline-v2.png" */
export function sanitizeImageFilename(original: string, mimeType: string): string {
  const ext =
    ALLOWED_IMAGE_TYPES[mimeType] ??
    (ALLOWED_EXTENSIONS.has(path.extname(original).toLowerCase())
      ? path.extname(original).toLowerCase()
      : ".png");
  const base = slugify(path.basename(original, path.extname(original)));
  return `${base}${ext}`;
}

function imagesDir(dir: string, draftId: string) {
  validateDraftId(draftId);
  return path.join(dir, draftId, "images");
}

/* Lists the union of both locations, so images uploaded locally before the
   bucket existed stay visible after Supabase takes over. */
export async function listImages(draftId: string): Promise<string[]> {
  validateDraftId(draftId);
  const names = new Set<string>();

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.storage.from(BUCKET).list(draftId);
    for (const object of data ?? []) {
      if (isValidImageFilename(object.name)) names.add(object.name);
    }
  }

  for (const dir of readableDraftsDirs()) {
    try {
      for (const name of await fs.readdir(imagesDir(dir, draftId))) {
        if (isValidImageFilename(name)) names.add(name);
      }
    } catch {
      /* no images folder yet — fine */
    }
  }
  return [...names].sort();
}

export async function readImage(
  draftId: string,
  filename: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!isValidImageFilename(filename)) return null;
  validateDraftId(draftId);

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage.from(BUCKET).download(`${draftId}/${filename}`);
    if (!error && data) {
      return {
        bytes: Buffer.from(await data.arrayBuffer()),
        contentType: contentTypeFor(filename),
      };
    }
    /* not in the bucket (or no bucket yet) — try the local folders */
  }

  for (const dir of readableDraftsDirs()) {
    try {
      const bytes = await fs.readFile(path.join(imagesDir(dir, draftId), filename));
      return { bytes, contentType: contentTypeFor(filename) };
    } catch {
      /* try the next readable location */
    }
  }
  return null;
}

/* Saves under a sanitized name; a different existing file with that name gets
   a -2/-3 suffix instead of being clobbered. Returns the final filename. */
export async function saveImage(
  draftId: string,
  originalName: string,
  mimeType: string,
  bytes: Buffer,
): Promise<string> {
  validateDraftId(draftId);

  const clean = sanitizeImageFilename(originalName, mimeType);
  const ext = path.extname(clean);
  const base = clean.slice(0, -ext.length);
  const existing = new Set(await listImages(draftId));
  let name = clean;
  for (let n = 2; existing.has(name); n++) {
    name = `${base}-${n}${ext}`;
  }

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${draftId}/${name}`, bytes, { contentType: mimeType });
    if (!error) return name;
    /* No bucket yet (setup SQL not run) → fall back to the local folder so
       having Supabase keys alone never breaks uploads. Other errors surface. */
    if (!/bucket/i.test(error.message)) throw new Error(error.message);
  }

  const dir = imagesDir(writableDraftsDir(), draftId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return name;
}

export async function deleteImage(draftId: string, filename: string): Promise<boolean> {
  if (!isValidImageFilename(filename)) return false;
  validateDraftId(draftId);

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage.from(BUCKET).remove([`${draftId}/${filename}`]);
    if (!error && (data?.length ?? 0) > 0) return true;
    /* not in the bucket — it may still be a local file */
  }

  try {
    await fs.unlink(path.join(imagesDir(writableDraftsDir(), draftId), filename));
    return true;
  } catch {
    return false;
  }
}

/* Removes all of the draft's images (called when the draft is deleted). */
export async function deleteAllImages(draftId: string): Promise<void> {
  validateDraftId(draftId);

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.storage.from(BUCKET).list(draftId);
    const names = (data ?? []).map((o) => o.name);
    if (names.length > 0) {
      await supabase.storage.from(BUCKET).remove(names.map((n) => `${draftId}/${n}`));
    }
  }

  /* always clear the local folder too — covers pre-bucket uploads */
  try {
    await fs.rm(path.join(writableDraftsDir(), draftId), { recursive: true, force: true });
  } catch {
    /* nothing to remove */
  }
}
