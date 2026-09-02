import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/server";
import { liveDataRequiredApiResponse } from "@/lib/data/api-errors";
import { getManageFilesTree } from "@/lib/data/files";
import type { ApiResponse } from "@/types/api";
import type { FileNode } from "@/types/domain";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const orgUnitId = Number(request.nextUrl.searchParams.get("orgUnitId") ?? 6703);
    if (!Number.isFinite(orgUnitId) || orgUnitId <= 0) {
      const body: ApiResponse<never> = {
        ok: false,
        error: { message: "orgUnitId must be a positive number.", status: 400 },
      };
      return NextResponse.json(body, { status: 400 });
    }

    const result = await getManageFilesTree(orgUnitId);
    const body: ApiResponse<FileNode> = {
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
      error: { message: "Failed to read the Manage Files tree.", status: 500 },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
