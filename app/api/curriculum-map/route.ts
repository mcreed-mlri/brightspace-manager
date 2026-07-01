import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { saveCurriculumMap } from "@/lib/data/curriculum-map";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types/api";
import type { CurriculumBranch, CurriculumMap } from "@/types/domain";

/* Save the whole curriculum map. Mirrors app/api/sync/run/route.ts:
   sign-in required (defense in depth beyond middleware), Supabase must be
   configured to persist, and the payload is validated before any write. */

function isValidMap(value: unknown): value is CurriculumMap {
  if (!value || typeof value !== "object") return false;
  const branches = (value as { branches?: unknown }).branches;
  if (!Array.isArray(branches)) return false;

  return branches.every((raw) => {
    if (!raw || typeof raw !== "object") return false;
    const b = raw as Partial<CurriculumBranch> & { type?: unknown };
    if (typeof b.id !== "string" || typeof b.title !== "string") return false;

    if (b.type === "columns") {
      const cols = (b as { columns?: unknown }).columns;
      return (
        Array.isArray(cols) &&
        cols.every(
          (c) =>
            c &&
            typeof (c as { id?: unknown }).id === "string" &&
            typeof (c as { title?: unknown }).title === "string" &&
            Array.isArray((c as { notes?: unknown }).notes) &&
            (c as { notes: unknown[] }).notes.every(
              (n) =>
                n &&
                typeof (n as { id?: unknown }).id === "string" &&
                typeof (n as { text?: unknown }).text === "string" &&
                ((n as { level?: unknown }).level === "topic" ||
                  (n as { level?: unknown }).level === "sub") &&
                ((n as { comment?: unknown }).comment === undefined ||
                  typeof (n as { comment?: unknown }).comment === "string"),
            ),
        )
      );
    }

    if (b.type === "grid") {
      const tiles = (b as { tiles?: unknown }).tiles;
      return (
        Array.isArray(tiles) &&
        tiles.every(
          (tile) =>
            tile &&
            typeof (tile as { id?: unknown }).id === "string" &&
            typeof (tile as { text?: unknown }).text === "string",
        )
      );
    }

    return false;
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  if (!isSupabaseConfigured()) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Saving requires a configured Supabase connection.", status: 409 },
    };
    return NextResponse.json(body, { status: 409 });
  }

  let payload: unknown;
  try {
    payload = (await request.json()) as { map?: unknown };
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Invalid JSON body.", status: 400 },
    };
    return NextResponse.json(body, { status: 400 });
  }

  const map = (payload as { map?: unknown })?.map;
  if (!isValidMap(map)) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Invalid curriculum map payload.", status: 400 },
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    await saveCurriculumMap(map, auth.user?.email);
    const now = new Date().toISOString();
    const body: ApiResponse<{ savedAt: string }> = {
      ok: true,
      data: { savedAt: now },
      source: "live",
      fetchedAt: now,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed.";
    const body: ApiResponse<never> = { ok: false, error: { message, status: 500 } };
    return NextResponse.json(body, { status: 500 });
  }
}
