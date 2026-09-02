import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { liveDataRequiredApiResponse } from "@/lib/data/api-errors";
import { runSyncCheck } from "@/lib/data/sync";
import type { ApiResponse } from "@/types/api";
import type { SyncReport } from "@/types/domain";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const result = await runSyncCheck();
    const body: ApiResponse<SyncReport> = {
      ok: true,
      data: result.data,
      source: result.source,
      fetchedAt: result.fetchedAt,
    };
    return NextResponse.json(body);
  } catch (error) {
    const liveRequired = liveDataRequiredApiResponse(error);
    if (liveRequired) return liveRequired;
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Sync check failed unexpectedly.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
