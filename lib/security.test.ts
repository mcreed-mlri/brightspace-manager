import { beforeEach, describe, expect, it } from "vitest";

import {
  rateLimit,
  requireSameOriginMutation,
  resetRateLimitsForTests,
  securityHeaders,
} from "@/lib/security";

const ORIGINAL_ENV = process.env;

function request(method: string, headers?: HeadersInit) {
  return new Request("https://app.example/api/write", { method, headers });
}

describe("requireSameOriginMutation", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.APP_BASE_URL;
  });

  it("ignores safe GET requests", () => {
    expect(requireSameOriginMutation(request("GET"))).toBeNull();
  });

  it("allows same-origin mutations", () => {
    expect(
      requireSameOriginMutation(request("POST", { origin: "https://app.example" })),
    ).toBeNull();
  });

  it("allows same-origin mutations from referer when Origin is absent", () => {
    expect(
      requireSameOriginMutation(
        request("DELETE", { referer: "https://app.example/settings/?tab=admin" }),
      ),
    ).toBeNull();
  });

  it("rejects missing-origin unsafe requests", async () => {
    const response = requireSameOriginMutation(request("POST"));

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toMatchObject({
      ok: false,
      error: { message: "Same-origin request required.", status: 403 },
    });
  });

  it("rejects cross-origin mutations against APP_BASE_URL", async () => {
    process.env.APP_BASE_URL = "https://pilot.example";
    const response = requireSameOriginMutation(request("PUT", { origin: "https://app.example" }));

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toMatchObject({
      ok: false,
      error: { message: "Cross-origin request rejected.", status: 403 },
    });
  });
});

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it("blocks requests beyond the configured window limit", async () => {
    expect(rateLimit("user:sync", { windowMs: 1000, max: 2 }, 100)).toBeNull();
    expect(rateLimit("user:sync", { windowMs: 1000, max: 2 }, 200)).toBeNull();

    const response = rateLimit("user:sync", { windowMs: 1000, max: 2 }, 300);

    expect(response?.status).toBe(429);
    expect(response?.headers.get("Retry-After")).toBe("1");
    await expect(response?.json()).resolves.toMatchObject({
      ok: false,
      error: { message: "Too many requests. Try again shortly.", status: 429 },
    });
  });
});

describe("securityHeaders", () => {
  it("returns the pilot hardening header set", () => {
    expect(securityHeaders()).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy-Report-Only": expect.stringContaining("frame-ancestors 'none'"),
    });
  });
});
