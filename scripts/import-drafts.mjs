/* One-time import of local Course Studio drafts (and their images) into
   Supabase. Run AFTER scripts/setup-course-drafts.sql:

       npm run import-drafts

   Reads course-drafts/*.json and uploads each into the course_drafts table,
   plus anything under course-drafts/{draftId}/images/ into the private
   course-studio-images bucket. Idempotent — re-running upserts the same
   rows and skips images that are already there. The local JSON files stay
   put as a backup; don't delete them. */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DRAFTS_DIR = path.join(process.cwd(), "course-drafts");
const TABLE = "course_drafts";
const BUCKET = "course-studio-images";

function loadEnv() {
  const env = {};
  for (const name of [".env", ".env.local"]) {
    let text = "";
    try {
      text = readFileSync(path.join(process.cwd(), name), "utf8");
    } catch {
      continue;
    }
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2];
    }
  }
  return env;
}

function isDeployReady(draft) {
  const p = draft.publish;
  return Boolean(
    p &&
    Number.isInteger(p.orgUnitId) &&
    p.orgUnitId > 0 &&
    p.orgUnitCode?.trim() &&
    /^[A-Za-z0-9._-]+$/.test(p.orgUnitCode.trim()) &&
    p.baseHost?.trim(),
  );
}

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env or .env.local.",
  );
  process.exit(1);
}
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let draftFiles = [];
try {
  draftFiles = readdirSync(DRAFTS_DIR).filter((n) => n.endsWith(".json"));
} catch {
  console.error(`No course-drafts folder found at ${DRAFTS_DIR}.`);
  process.exit(1);
}

let failures = 0;
for (const file of draftFiles) {
  let draft;
  try {
    draft = JSON.parse(readFileSync(path.join(DRAFTS_DIR, file), "utf8"));
  } catch {
    console.warn(`  SKIP ${file} — not valid JSON`);
    failures++;
    continue;
  }
  if (!draft?.id) {
    console.warn(`  SKIP ${file} — no draft id`);
    failures++;
    continue;
  }

  const { error } = await supabase.from(TABLE).upsert(
    {
      id: draft.id,
      data: draft,
      course_title: draft.courseTitle ?? "",
      deploy_ready: isDeployReady(draft),
      created_at: draft.createdAt ?? new Date().toISOString(),
      updated_at: draft.updatedAt ?? new Date().toISOString(),
      updated_by: "import-drafts script",
    },
    { onConflict: "id" },
  );
  if (error) {
    console.error(`  FAIL ${draft.id} — ${error.message}`);
    failures++;
    continue;
  }
  console.log(`  draft ${draft.id} — imported`);

  /* images live at course-drafts/{draftId}/images/ */
  let imageNames = [];
  try {
    imageNames = readdirSync(path.join(DRAFTS_DIR, draft.id, "images"));
  } catch {
    continue; /* no images folder — done with this draft */
  }
  for (const name of imageNames) {
    const contentType = CONTENT_TYPES[path.extname(name).toLowerCase()];
    if (!contentType) {
      console.warn(`    skip image ${name} — unsupported type`);
      continue;
    }
    const bytes = readFileSync(path.join(DRAFTS_DIR, draft.id, "images", name));
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(`${draft.id}/${name}`, bytes, { contentType, upsert: true });
    if (uploadError) {
      console.error(`    FAIL image ${name} — ${uploadError.message}`);
      failures++;
    } else {
      console.log(`    image ${name} — uploaded`);
    }
  }
}

console.log(
  failures === 0
    ? `\nDone. ${draftFiles.length} draft(s) imported cleanly.`
    : `\nDone with ${failures} problem(s) — see messages above.`,
);
process.exit(failures === 0 ? 0 : 1);
