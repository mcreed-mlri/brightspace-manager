import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { saveCurriculumMap } from "@/lib/data/curriculum-map";
import { clientKey, rateLimit, RATE_LIMITS, requireSameOriginMutation } from "@/lib/security";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types/api";
import type { CurriculumBranch, CurriculumMap } from "@/types/domain";

/* Save the whole curriculum map. Mirrors app/api/sync/run/route.ts:
   sign-in required (defense in depth beyond middleware), Supabase must be
   configured to persist, and the payload is validated before any write. */

/* A required label: present, a string, and not blank after trimming. */
function isLabel(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidMap(value: unknown): value is CurriculumMap {
  if (!value || typeof value !== "object") return false;
  const branches = (value as { branches?: unknown }).branches;
  if (!Array.isArray(branches)) return false;

  return branches.every((raw) => {
    if (!raw || typeof raw !== "object") return false;
    const b = raw as Partial<CurriculumBranch> & { type?: unknown };
    if (typeof b.id !== "string" || !isLabel(b.title)) return false;

    if (b.type === "columns") {
      const cols = (b as { columns?: unknown }).columns;
      return (
        Array.isArray(cols) &&
        cols.every(
          (c) =>
            c &&
            typeof (c as { id?: unknown }).id === "string" &&
            isLabel((c as { title?: unknown }).title) &&
            Array.isArray((c as { notes?: unknown }).notes) &&
            (c as { notes: unknown[] }).notes.every(
              (n) =>
                n &&
                typeof (n as { id?: unknown }).id === "string" &&
                isLabel((n as { text?: unknown }).text) &&
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
            isLabel((tile as { text?: unknown }).text),
        )
      );
    }

    return false;
  });
}

export async function POST(request: NextRequest) {
  const originError = requireSameOriginMutation(request);
  if (originError) return originError;

  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const limited = rateLimit(
    `curriculum-map:${clientKey(request, auth.user?.email)}`,
    RATE_LIMITS.draftWrite,
  );
  if (limited) return limited;

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
    let message = error instanceof Error ? error.message : "Save failed.";
    if (/permission denied/i.test(message)) {
      message =
        "Database permission denied for curriculum_map. In the Supabase SQL Editor, run scripts/setup-curriculum-map.sql for this project (create table, enable RLS, and grant service_role access).";
    }
    const body: ApiResponse<never> = { ok: false, error: { message, status: 500 } };
    return NextResponse.json(body, { status: 500 });
  }
}
