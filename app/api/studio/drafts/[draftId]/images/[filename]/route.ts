import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { deleteImage, isValidImageFilename, readImage } from "@/lib/studio/images";
import type { ApiResponse } from "@/types/api";

type Params = { params: Promise<{ draftId: string; filename: string }> };

function err(message: string, status: number) {
  const body: ApiResponse<never> = { ok: false, error: { message, status } };
  return NextResponse.json(body, { status });
}

/* Serves one uploaded image (editor thumbnails and the learner preview). */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { draftId, filename } = await params;
  if (!isValidImageFilename(filename)) return err("Invalid image name.", 400);

  const image = await readImage(draftId, filename);
  if (!image) return err("Image not found.", 404);

  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "no-store",
    },
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { draftId, filename } = await params;
  if (!isValidImageFilename(filename)) return err("Invalid image name.", 400);

  const removed = await deleteImage(draftId, filename);
  if (!removed) return err("Image not found.", 404);

  const body: ApiResponse<{ filename: string }> = {
    ok: true,
    data: { filename },
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
  return NextResponse.json(body);
}
