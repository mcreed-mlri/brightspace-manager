import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { checkSupabaseHealth } from "@/lib/data/health";
import type { ApiResponse } from "@/types/api";
import type { HealthStatus } from "@/types/domain";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const health = await checkSupabaseHealth();
    const body: ApiResponse<HealthStatus> = {
      ok: true,
      data: health,
      source: health.status === "ok" ? "live" : "mock",
      fetchedAt: health.checkedAt,
    };
    return NextResponse.json(body);
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Supabase health check failed unexpectedly.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
