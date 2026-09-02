import { NextResponse } from "next/server";

import { isMockDataDisabledError } from "@/lib/data/mode";
import type { ApiResponse } from "@/types/api";

export function liveDataRequiredApiResponse(error: unknown): NextResponse<ApiResponse<never>> | null {
  if (!isMockDataDisabledError(error)) return null;
  return NextResponse.json(
    {
      ok: false,
      error: { message: error.message, status: error.status },
    },
    { status: error.status },
  );
}
