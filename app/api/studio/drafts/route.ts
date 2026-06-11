import { NextResponse, type NextRequest } from "next/server";

import { createDraft, listDrafts } from "@/lib/studio/drafts";
import type { ApiResponse } from "@/types/api";
import type { CourseDraft, DraftSummary } from "@/types/studio";

export async function GET() {
  try {
    const drafts = await listDrafts();
    const body: ApiResponse<DraftSummary[]> = {
      ok: true,
      data: drafts,
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Failed to list drafts.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = (await request.json()) as { courseTitle?: string };
    const title = (json.courseTitle ?? "").trim();
    if (!title) {
      const body: ApiResponse<never> = {
        ok: false,
        error: { message: "courseTitle is required.", status: 400 },
      };
      return NextResponse.json(body, { status: 400 });
    }
    const draft = await createDraft(title);
    const body: ApiResponse<CourseDraft> = {
      ok: true,
      data: draft,
      source: "live",
      fetchedAt: draft.updatedAt,
    };
    return NextResponse.json(body, { status: 201 });
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Failed to create the draft.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
