import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { canSyncWrite, executeSyncPlan } from "@/lib/data/sync-write";
import { clientKey, rateLimit, RATE_LIMITS, requireSameOriginMutation } from "@/lib/security";
import type { ApiResponse } from "@/types/api";
import type { SyncRunResult } from "@/types/domain";

export async function POST(request: NextRequest) {
  const originError = requireSameOriginMutation(request);
  if (originError) return originError;

  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const limited = rateLimit(
    `sync-run:${clientKey(request, auth.user?.email)}`,
    RATE_LIMITS.syncRun,
  );
  if (limited) return limited;

  if (!canSyncWrite()) {
    const body: ApiResponse<never> = {
      ok: false,
      error: {
        message: "Sync requires live Brightspace and Supabase connections.",
        status: 409,
      },
    };
    return NextResponse.json(body, { status: 409 });
  }

  /* Explicit confirmation required — a bare POST does nothing. */
  let confirmed = false;
  try {
    const json = (await request.json()) as { confirm?: boolean };
    confirmed = json.confirm === true;
  } catch {
    /* no body */
  }
  if (!confirmed) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: 'Missing confirmation. Send { "confirm": true }.', status: 400 },
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const result = await executeSyncPlan(auth.user?.email);
    const body: ApiResponse<SyncRunResult> = {
      ok: true,
      data: result,
      source: "live",
      fetchedAt: result.ranAt,
    };
    return NextResponse.json(body, { status: result.failed > 0 ? 500 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync run failed.";
    const body: ApiResponse<never> = { ok: false, error: { message, status: 500 } };
    return NextResponse.json(body, { status: 500 });
  }
}
