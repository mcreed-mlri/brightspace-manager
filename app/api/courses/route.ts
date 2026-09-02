import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { liveDataRequiredApiResponse } from "@/lib/data/api-errors";
import { listCourseOfferings } from "@/lib/data/courses";
import type { ApiResponse } from "@/types/api";
import type { CourseOffering } from "@/types/domain";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const result = await listCourseOfferings();
    const params = request.nextUrl.searchParams;

    const q = params.get("q")?.toLowerCase() ?? "";
    const status = params.get("status"); // "active" | "archived"
    const jurisdiction = params.get("jurisdiction");
    const program = params.get("program");

    let courses = result.data;
    if (q) {
      courses = courses.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          String(c.orgUnitId).includes(q),
      );
    }
    if (status === "active") courses = courses.filter((c) => c.isActive);
    if (status === "archived") courses = courses.filter((c) => !c.isActive);
    if (jurisdiction) courses = courses.filter((c) => c.jurisdiction === jurisdiction);
    if (program) courses = courses.filter((c) => c.program === program);

    const body: ApiResponse<CourseOffering[]> = {
      ok: true,
      data: courses,
      source: result.source,
      fetchedAt: result.fetchedAt,
    };
    return NextResponse.json(body);
  } catch (error) {
    const liveRequired = liveDataRequiredApiResponse(error);
    if (liveRequired) return liveRequired;
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "Failed to list course offerings.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
