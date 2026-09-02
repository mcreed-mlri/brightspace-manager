import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { emptyTopic, type CourseDraft } from "@/types/studio";

const routeMocks = vi.hoisted(() => ({
  deleteDraft: vi.fn(),
  readDraft: vi.fn(),
  requireUser: vi.fn(),
  writeDraft: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  requireUser: routeMocks.requireUser,
}));

vi.mock("@/lib/studio/drafts", () => ({
  deleteDraft: routeMocks.deleteDraft,
  readDraft: routeMocks.readDraft,
  writeDraft: routeMocks.writeDraft,
}));

import { PUT } from "@/app/api/studio/drafts/[draftId]/route";

function validDraft(overrides: Partial<CourseDraft> = {}): CourseDraft {
  return {
    id: "client-owned-id",
    createdAt: "2026-09-02T12:00:00.000Z",
    updatedAt: "2026-09-02T12:00:00.000Z",
    courseId: "course-id",
    courseTitle: "Course Title",
    courseSubtitle: "",
    courseBlurb: "",
    courseArea: "",
    topic: "foundations",
    chromeMode: "bar",
    homeLinkUrl: "https://example.com/",
    modules: [
      {
        id: "module-1",
        title: "Module 1",
        description: "",
        topics: [emptyTopic("topic-1", "Topic 1")],
      },
    ],
    ...overrides,
  };
}

function requestWithJson(body: unknown) {
  return new Request("http://localhost/api/studio/drafts/existing", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const params = { params: Promise.resolve({ draftId: "existing" }) };

describe("PUT /api/studio/drafts/[draftId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeMocks.requireUser.mockResolvedValue({
      ok: true,
      user: { id: "user-1", email: "admin@mlri.org" },
    });
    routeMocks.readDraft.mockResolvedValue(
      validDraft({
        id: "existing",
        createdAt: "2026-09-01T12:00:00.000Z",
      }),
    );
    routeMocks.writeDraft.mockImplementation(async (draft: CourseDraft) => ({
      ...draft,
      updatedAt: "2026-09-02T13:00:00.000Z",
    }));
  });

  it("rejects invalid draft payloads before writing", async () => {
    const response = await PUT(
      requestWithJson({ courseTitle: 42 }) as unknown as NextRequest,
      params,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        message: "Invalid course draft payload: id must be a string.",
        status: 400,
      },
    });
    expect(routeMocks.writeDraft).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await PUT(
      new Request("http://localhost/api/studio/drafts/existing", {
        method: "PUT",
        body: "{",
        headers: { "content-type": "application/json" },
      }) as unknown as NextRequest,
      params,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { message: "Invalid JSON payload.", status: 400 },
    });
    expect(routeMocks.writeDraft).not.toHaveBeenCalled();
  });

  it("preserves server-owned id and createdAt for valid saves", async () => {
    const response = await PUT(
      requestWithJson(
        validDraft({
          id: "spoofed",
          createdAt: "2000-01-01T00:00:00.000Z",
        }),
      ) as unknown as NextRequest,
      params,
    );

    expect(response.status).toBe(200);
    expect(routeMocks.writeDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "existing",
        createdAt: "2026-09-01T12:00:00.000Z",
      }),
      "admin@mlri.org",
    );
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        id: "existing",
        createdAt: "2026-09-01T12:00:00.000Z",
      },
    });
  });
});
