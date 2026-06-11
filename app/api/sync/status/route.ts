import { NextResponse } from "next/server";

import { getSyncStatus } from "@/lib/data/sync";
import type { ApiResponse } from "@/types/api";
import type { SyncStatus } from "@/types/domain";

export async function GET() {
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
