import { NextResponse } from "next/server";

import { checkSupabaseHealth } from "@/lib/data/health";

/* Public liveness probe for ops dashboards (Training Unit command center).
   Returns only ok / db / latencyMs — no env values, error strings, or row data.
   Sign-in is intentionally NOT required; middleware allows this path through. */

export async function GET() {
  const started = Date.now();

  try {
    const health = await checkSupabaseHealth();
    const db =
      health.status === "ok" ? "ok" : health.status === "unconfigured" ? "unconfigured" : "fail";

    return NextResponse.json({
      ok: health.status === "ok",
      db,
      latencyMs: Date.now() - started,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        db: "fail",
        latencyMs: Date.now() - started,
      },
      { status: 500 },
    );
  }
}
