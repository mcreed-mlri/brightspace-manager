import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { readDraft } from "@/lib/studio/drafts";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, listImages, saveImage } from "@/lib/studio/images";
import type { ApiResponse } from "@/types/api";

type Params = { params: Promise<{ draftId: string }> };

function err(message: string, status: number) {
  const body: ApiResponse<never> = { ok: false, error: { message, status } };
  return NextResponse.json(body, { status });
}

/* Lists the draft's uploaded image filenames. */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { draftId } = await params;
  if (!(await readDraft(draftId))) return err("Draft not found.", 404);

  try {
    const body: ApiResponse<{ filenames: string[] }> = {
      ok: true,
      data: { filenames: await listImages(draftId) },
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch {
    return err("Could not list images.", 500);
  }
}

/* Uploads one image (multipart form, field "file"). Returns the stored
   filename — sanitized, and suffixed if the name was already taken. */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { draftId } = await params;
  if (!(await readDraft(draftId))) return err("Draft not found.", 404);

  let file: File | null = null;
  try {
    const form = await request.formData();
    const entry = form.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return err("Expected an image file upload.", 400);
  }
  if (!file) return err("Expected an image file upload.", 400);

  if (!(file.type in ALLOWED_IMAGE_TYPES)) {
    return err("That file type isn't supported — use a PNG, JPG, WebP, or GIF image.", 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return err(`That image is ${mb} MB — the limit is 4 MB. Try exporting it smaller.`, 400);
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = await saveImage(draftId, file.name, file.type, bytes);
    const body: ApiResponse<{ filename: string }> = {
      ok: true,
      data: { filename },
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch {
    return err("Upload failed.", 500);
  }
}
