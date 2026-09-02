import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const routeMocks = vi.hoisted(() => ({
  createDraft: vi.fn(),
  listDrafts: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  requireUser: routeMocks.requireUser,
}));

vi.mock("@/lib/studio/drafts", () => ({
  createDraft: routeMocks.createDraft,
  listDrafts: routeMocks.listDrafts,
}));

import { POST } from "@/app/api/studio/drafts/route";

describe("POST /api/studio/drafts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeMocks.requireUser.mockResolvedValue({
      ok: true,
      user: { id: "user-1", email: "admin@mlri.org" },
    });
  });

  it("rejects cross-origin draft creation before writing", async () => {
    const response = await POST(
      new Request("http://localhost/api/studio/drafts/", {
        method: "POST",
        body: JSON.stringify({ courseTitle: "Housing Basics" }),
        headers: {
          "content-type": "application/json",
          origin: "https://attacker.example",
        },
      }) as unknown as NextRequest,
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { message: "Cross-origin request rejected.", status: 403 },
    });
    expect(routeMocks.createDraft).not.toHaveBeenCalled();
  });
});
