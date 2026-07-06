import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { readDraft } from "@/lib/studio/drafts";
import { listImages } from "@/lib/studio/images";
import { generateTopicHtml } from "@/lib/studio/generate";
import { isTemplateAvailable, readWrapperFile } from "@/lib/studio/template";
import type { ApiResponse } from "@/types/api";

type Params = { params: Promise<{ draftId: string }> };

/* Returns a topic's generated HTML with the wrapper CSS inlined, for an
   iframe srcdoc preview. The nav chrome is omitted (it needs the full
   package); this previews content + styling, which is what editing needs. */
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

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

    /* The preview iframe is sandboxed without allow-scripts, so the inline
       data-topic script never runs. Set the topic accent as a static <html>
       attribute instead, so it applies from CSS alone. */
    html = html.replace('<html lang="en">', `<html lang="en" data-topic="${draft.topic}">`);

    if (await isTemplateAvailable()) {
      const css = await readWrapperFile("course-style.css");
      html = html
        .replace('<link rel="stylesheet" href="course-style.css">', `<style>\n${css}\n</style>`)
        .replace('<script src="course-config.js"></script>', "")
        .replace('<script src="course-nav.js" defer></script>', "");
    }

    /* Next-up/continue links target sibling topic files that exist only in the
       exported package; inside the iframe they resolve against the app URL and
       load the whole app. Neutralise them — the preview is content-only. */
    html = html.replace(
      "</head>",
      '<style>[data-lace="next-link"]{pointer-events:none;cursor:default;}</style>\n</head>',
    );

    /* Uploaded images render for real (the srcdoc iframe is same-origin, so
       the app's image API works inside it); anything referenced by name only
       renders as a labeled box showing where the figure will sit. */
    const uploaded = new Set(await listImages(draftId));
    html = html.replace(
      /<img src="images\/([^"]+)" alt="([^"]*)"[^>]*\/>/g,
      (match, filename, alt) =>
        uploaded.has(filename)
          ? match.replace(
              `src="images/${filename}"`,
              `src="/api/studio/drafts/${draftId}/images/${filename}"`,
            )
          : `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:120px;border:2px dashed var(--line, #d3d8e0);border-radius:10px;color:var(--muted, #8b909d);font-size:0.8rem;">` +
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
