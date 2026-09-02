import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const middlewareMocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: middlewareMocks.createServerClient,
}));

import { middleware } from "@/middleware";

const ORIGINAL_ENV = process.env;

function setAuthEnv() {
  process.env = {
    ...ORIGINAL_ENV,
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  };
}

describe("middleware security posture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthEnv();
  });

  it("fails closed for protected API routes when configured auth cannot initialize", async () => {
    middlewareMocks.createServerClient.mockImplementation(() => {
      throw new Error("auth init failed");
    });

    const response = await middleware(new NextRequest("https://app.example/api/courses/"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { message: "Authentication service unavailable.", status: 503 },
    });
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("keeps the public health probe reachable", async () => {
    middlewareMocks.createServerClient.mockImplementation(() => {
      throw new Error("auth init failed");
    });

    const response = await middleware(new NextRequest("https://app.example/api/health/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
