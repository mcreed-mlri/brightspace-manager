import { NextResponse } from "next/server";

import { isTemplateAvailable, readWrapperFile } from "@/lib/studio/template";

/* Serves the wrapper's course-style.css to the builder's live preview, so
   the preview pane renders with the REAL course design — when the wrapper
   repo changes, the preview follows automatically. Read-only, whitelisted
   to the one stylesheet. */

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isTemplateAvailable())) {
    return NextResponse.json(
      { ok: false, error: { message: "Wrapper template not found.", status: 404 } },
      { status: 404 },
    );
  }

  const css = await readWrapperFile("course-style.css");
  return new NextResponse(css, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "private, max-age=60",
    },
  });
}
