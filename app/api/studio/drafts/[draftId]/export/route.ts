import JSZip from "jszip";
import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { clientKey, noStoreHeaders, rateLimit, RATE_LIMITS } from "@/lib/security";
import { publishProblems } from "@/lib/studio/deploy";
import { readDraft } from "@/lib/studio/drafts";
import { buildPackageFiles, validateDraft } from "@/lib/studio/generate";
import { slugify } from "@/lib/studio/slug";
import { isTemplateAvailable } from "@/lib/studio/template";
import type { ApiResponse } from "@/types/api";

type Params = { params: Promise<{ draftId: string }> };
const MAX_EXPORT_FILES = 100;
const MAX_EXPORT_UNCOMPRESSED_BYTES = 50 * 1024 * 1024;
const MAX_EXPORT_ZIP_BYTES = 25 * 1024 * 1024;

function contentSize(content: string | Uint8Array): number {
  return typeof content === "string" ? Buffer.byteLength(content, "utf8") : content.byteLength;
}

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const limited = rateLimit(
    `studio-export:${clientKey(request, auth.user?.email)}`,
    RATE_LIMITS.export,
  );
  if (limited) return limited;

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

  const problems = [...validateDraft(draft), ...publishProblems(draft)];
  if (problems.length > 0) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: `Fix before export: ${problems.join(" ")}`, status: 400 },
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const files = await buildPackageFiles(draft);
    if (files.size > MAX_EXPORT_FILES) {
      const body: ApiResponse<never> = {
        ok: false,
        error: { message: "Export is too large: too many files.", status: 400 },
      };
      return NextResponse.json(body, { status: 400 });
    }
    const totalBytes = [...files.values()].reduce((sum, content) => sum + contentSize(content), 0);
    if (totalBytes > MAX_EXPORT_UNCOMPRESSED_BYTES) {
      const body: ApiResponse<never> = {
        ok: false,
        error: { message: "Export is too large: package contents exceed 50 MB.", status: 400 },
      };
      return NextResponse.json(body, { status: 400 });
    }

    const zip = new JSZip();
    for (const [name, content] of files) {
      zip.file(name, content);
    }
    /* Course package convention: keep asset folders ready for images/PDFs. */
    zip.folder("images");
    zip.folder("assets");

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    if (buffer.byteLength > MAX_EXPORT_ZIP_BYTES) {
      const body: ApiResponse<never> = {
        ok: false,
        error: { message: "Export is too large: ZIP exceeds 25 MB.", status: 400 },
      };
      return NextResponse.json(body, { status: 400 });
    }
    const filename = `${slugify(draft.courseId || draft.id || "course-package")}.zip`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: noStoreHeaders({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    const body: ApiResponse<never> = { ok: false, error: { message, status: 500 } };
    return NextResponse.json(body, { status: 500 });
  }
}
