import { NextResponse, type NextRequest } from "next/server";

import type { ApiResponse } from "@/types/api";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type RateEntry = {
  count: number;
  resetAt: number;
};

const rateEntries = new Map<string, RateEntry>();

export type RateLimitPolicy = {
  windowMs: number;
  max: number;
};

export const RATE_LIMITS = {
  signIn: { windowMs: 60 * 60 * 1000, max: 5 },
  draftWrite: { windowMs: 60 * 1000, max: 90 },
  imageUpload: { windowMs: 60 * 1000, max: 20 },
  export: { windowMs: 60 * 1000, max: 20 },
  syncRun: { windowMs: 5 * 60 * 1000, max: 3 },
} satisfies Record<string, RateLimitPolicy>;

export function getAppBaseUrl(): URL | null {
  const raw = process.env.APP_BASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function expectedOrigin(request: NextRequest | Request): string {
  return getAppBaseUrl()?.origin ?? new URL(request.url).origin;
}

function requestOrigin(request: NextRequest | Request): string | null {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const referer = request.headers.get("referer");
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function securityError(message: string, status = 403): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ ok: false, error: { message, status } }, { status });
}

export function requireSameOriginMutation(
  request: NextRequest | Request,
): NextResponse<ApiResponse<never>> | null {
  if (!UNSAFE_METHODS.has(request.method.toUpperCase())) return null;

  const actual = requestOrigin(request);
  if (!actual) return securityError("Same-origin request required.");
  if (actual !== expectedOrigin(request)) return securityError("Cross-origin request rejected.");
  return null;
}

export function clientKey(request: NextRequest | Request, userKey?: string | null): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return userKey || forwarded || realIp || "unknown-client";
}

export function rateLimit(
  key: string,
  policy: RateLimitPolicy,
  now = Date.now(),
): NextResponse<ApiResponse<never>> | null {
  const existing = rateEntries.get(key);
  if (!existing || existing.resetAt <= now) {
    rateEntries.set(key, { count: 1, resetAt: now + policy.windowMs });
    return null;
  }

  existing.count += 1;
  if (existing.count <= policy.max) return null;

  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return NextResponse.json(
    {
      ok: false,
      error: {
        message: "Too many requests. Try again shortly.",
        status: 429,
      },
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

export function resetRateLimitsForTests() {
  rateEntries.clear();
}

export function securityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy-Report-Only":
      "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://auth.brightspace.com https://*.brightspace.com",
  };
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [name, value] of Object.entries(securityHeaders())) {
    response.headers.set(name, value);
  }
  return response;
}

export function noStoreHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    ...extra,
    "X-Content-Type-Options": "nosniff",
  };
}
