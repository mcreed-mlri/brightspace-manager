import { NextResponse, type NextRequest } from "next/server";

import { readDraft, writeDraft } from "@/lib/studio/drafts";
import type { ApiResponse } from "@/types/api";
import type { CourseDraft } from "@/types/studio";

type Params = { params: Promise<{ draftId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { draftId } = await params;
  const draft = await readDraft(draftId);
  if (!draft) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Draft not found.", status: 404 },
    };
    return NextResponse.json(body, { status: 404 });
  }
  const body: ApiResponse<CourseDraft> = {
    ok: true,
    data: draft,
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
  return NextResponse.json(body);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { draftId } = await params;
  const existing = await readDraft(draftId);
  if (!existing) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Draft not found.", status: 404 },
    };
    return NextResponse.json(body, { status: 404 });
  }

  try {
    const incoming = (await request.json()) as CourseDraft;
    /* id and createdAt are server-owned. */
    const saved = await writeDraft({ ...incoming, id: existing.id, createdAt: existing.createdAt });
    const body: ApiResponse<CourseDraft> = {
      ok: true,
      data: saved,
      source: "live",
      fetchedAt: saved.updatedAt,
    };
    return NextResponse.json(body);
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Failed to save the draft.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
