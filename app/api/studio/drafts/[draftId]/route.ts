import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { deleteDraft, readDraft, writeDraft } from "@/lib/studio/drafts";
import { validateCourseDraft } from "@/lib/studio/validate-draft";
import type { ApiResponse } from "@/types/api";
import type { CourseDraft } from "@/types/studio";

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
  const body: ApiResponse<CourseDraft> = {
    ok: true,
    data: draft,
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
  return NextResponse.json(body);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { draftId } = await params;
  const existing = await readDraft(draftId);
  if (!existing) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Draft not found.", status: 404 },
    };
    return NextResponse.json(body, { status: 404 });
  }

  let incoming: unknown;
  try {
    incoming = await request.json();
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Invalid JSON payload.", status: 400 },
    };
    return NextResponse.json(body, { status: 400 });
  }

  const validated = validateCourseDraft(incoming);
  if (!validated.ok) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: validated.message, status: 400 },
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    /* id and createdAt are server-owned. */
    const saved = await writeDraft(
      { ...validated.draft, id: existing.id, createdAt: existing.createdAt },
      auth.user?.email,
    );
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

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

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
    await deleteDraft(draftId);
    const body: ApiResponse<{ id: string }> = {
      ok: true,
      data: { id: draftId },
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Failed to delete the course.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
