import JSZip from "jszip";
import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { readDraft } from "@/lib/studio/drafts";
import { buildPackageFiles, validateDraft } from "@/lib/studio/generate";
import { isTemplateAvailable } from "@/lib/studio/template";
import type { ApiResponse } from "@/types/api";

type Params = { params: Promise<{ draftId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { draftId } = await params;
  const draft = await readDraft(draftId);
  if (!draft) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Draft not found.", status: 404 },
    };
    return NextResponse.json(body, { status: 404 });
  }

  if (!(await isTemplateAvailable())) {
    const body: ApiResponse<never> = {
      ok: false,
      error: {
        message: "Course template not found. Check the template source in Settings.",
        status: 409,
      },
    };
    return NextResponse.json(body, { status: 409 });
  }

  const problems = validateDraft(draft);
  if (problems.length > 0) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: `Fix before export: ${problems.join(" ")}`, status: 400 },
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const files = await buildPackageFiles(draft);
    const zip = new JSZip();
    for (const [name, content] of files) {
      zip.file(name, content);
    }
    /* Course package convention: keep asset folders ready for images/PDFs. */
    zip.folder("images");
    zip.folder("assets");

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${draft.courseId}.zip"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    const body: ApiResponse<never> = { ok: false, error: { message, status: 500 } };
    return NextResponse.json(body, { status: 500 });
  }
}
