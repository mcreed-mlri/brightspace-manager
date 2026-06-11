import { NextResponse, type NextRequest } from "next/server";

import { readDraft } from "@/lib/studio/drafts";
import { generateTopicHtml } from "@/lib/studio/generate";
import { isTemplateAvailable, readWrapperFile } from "@/lib/studio/template";
import type { ApiResponse } from "@/types/api";

type Params = { params: Promise<{ draftId: string }> };

/* Returns a topic's generated HTML with the wrapper CSS inlined, for an
   iframe srcdoc preview. The nav chrome is omitted (it needs the full
   package); this previews content + styling, which is what editing needs. */
export async function GET(request: NextRequest, { params }: Params) {
  const { draftId } = await params;
  const slug = request.nextUrl.searchParams.get("slug") ?? "";

  const draft = await readDraft(draftId);
  if (!draft) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Draft not found.", status: 404 },
    };
    return NextResponse.json(body, { status: 404 });
  }

  try {
    let html = generateTopicHtml(draft, slug);

    if (isTemplateAvailable()) {
      const css = await readWrapperFile("course-style.css");
      html = html
        .replace('<link rel="stylesheet" href="course-style.css">', `<style>\n${css}\n</style>`)
        .replace('<script src="course-config.js"></script>', "")
        .replace('<script src="course-nav.js" defer></script>', "");
      /* Inline the topic accent since course-config.js is stripped. */
      html = html.replace(
        /<script>document\.documentElement\.dataset\.topic[^<]+<\/script>/,
        `<script>document.documentElement.dataset.topic = "${draft.topic}";</script>`,
      );
    }

    /* Image files don't exist yet (placeholders) — render a labeled box so
       the preview shows where each figure will sit. */
    html = html.replace(
      /<img src="images\/([^"]+)" alt="([^"]*)"[^>]*\/>/g,
      (_match, filename, alt) =>
        `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:120px;border:2px dashed var(--line, #d3d8e0);border-radius:10px;color:var(--muted, #8b909d);font-size:0.8rem;">` +
        `<span style="font-size:1.4rem;">🖼</span><strong>images/${filename}</strong><span>${alt}</span></div>`,
    );

    const body: ApiResponse<{ html: string }> = {
      ok: true,
      data: { html },
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Preview failed.";
    const body: ApiResponse<never> = { ok: false, error: { message, status: 500 } };
    return NextResponse.json(body, { status: 500 });
  }
}
