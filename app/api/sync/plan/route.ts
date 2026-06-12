import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { buildSyncPlan, canSyncWrite } from "@/lib/data/sync-write";
import type { ApiResponse } from "@/types/api";
import type { SyncPlan } from "@/types/domain";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

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

  try {
    const plan = await buildSyncPlan();
    const body: ApiResponse<SyncPlan> = {
      ok: true,
      data: plan,
      source: "live",
      fetchedAt: plan.builtAt,
    };
    return NextResponse.json(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build the sync plan.";
    const body: ApiResponse<never> = { ok: false, error: { message, status: 500 } };
    return NextResponse.json(body, { status: 500 });
  }
}
