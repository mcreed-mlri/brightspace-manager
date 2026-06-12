import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { getTemplateInfo } from "@/lib/studio/template";
import type { ApiResponse } from "@/types/api";
import type { TemplateInfo } from "@/types/studio";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const info = await getTemplateInfo();
    const body: ApiResponse<TemplateInfo> = {
      ok: true,
      data: info,
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Failed to read the course template.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
