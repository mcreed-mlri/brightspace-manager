import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: authMocks.createServerClient,
}));

vi.mock("next/headers", () => ({
  cookies: authMocks.cookies,
}));

import { isAllowedOrgEmail, requireUser } from "@/lib/auth/server";

const ORIGINAL_ENV = process.env;

function setAuthEnv(configured: boolean) {
  process.env = { ...ORIGINAL_ENV };
  if (configured) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  } else {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
}

describe("isAllowedOrgEmail", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.AUTH_ALLOWED_EMAIL_DOMAINS;
  });

  it("allows any email when no domain allowlist is configured", () => {
    expect(isAllowedOrgEmail("person@example.com")).toBe(true);
  });

  it("matches configured domains case-insensitively", () => {
    process.env.AUTH_ALLOWED_EMAIL_DOMAINS = "EBHCS.org, mlri.org";

    expect(isAllowedOrgEmail("admin@mlri.org")).toBe(true);
    expect(isAllowedOrgEmail("admin@other.org")).toBe(false);
    expect(isAllowedOrgEmail(null)).toBe(false);
  });
});

describe("requireUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.cookies.mockResolvedValue({
      getAll: vi.fn(() => []),
      set: vi.fn(),
    });
  });

  it("keeps mock/dev mode open when auth is unconfigured", async () => {
    setAuthEnv(false);

    await expect(requireUser()).resolves.toEqual({ ok: true, user: null });
    expect(authMocks.createServerClient).not.toHaveBeenCalled();
  });

  it("returns 401 when configured auth has no valid user", async () => {
    setAuthEnv(true);
    authMocks.createServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const result = await requireUser();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: { message: "Sign-in required.", status: 401 },
      });
    }
  });

  it("returns the validated session user when configured auth succeeds", async () => {
    setAuthEnv(true);
    authMocks.createServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "admin@mlri.org" } },
          error: null,
        }),
      },
    });

    await expect(requireUser()).resolves.toEqual({
      ok: true,
      user: { id: "user-1", email: "admin@mlri.org" },
    });
  });

  it("fails closed when configured auth cannot initialize", async () => {
    setAuthEnv(true);
    authMocks.createServerClient.mockImplementation(() => {
      throw new Error("auth client failed");
    });

    const result = await requireUser();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(503);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: { message: "Authentication service unavailable.", status: 503 },
      });
    }
  });
});
