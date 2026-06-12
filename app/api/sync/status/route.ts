import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { getSyncStatus } from "@/lib/data/sync";
import type { ApiResponse } from "@/types/api";
import type { SyncStatus } from "@/types/domain";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const result = await getSyncStatus();
    const body: ApiResponse<SyncStatus> = {
      ok: true,
      data: result.data,
      source: result.source,
      fetchedAt: result.fetchedAt,
    };
    return NextResponse.json(body);
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Failed to compute sync status.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
