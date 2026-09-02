import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAuthEnv, isAuthConfigured } from "@/lib/auth/config";
import { applySecurityHeaders } from "@/lib/security";

function authUnavailable(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: { message: "Authentication service unavailable.", status: 503 } },
      { status: 503 },
    );
  }
  const signInUrl = request.nextUrl.clone();
  signInUrl.pathname = "/sign-in";
  signInUrl.search = "";
  signInUrl.searchParams.set("error", "Authentication service unavailable. Try again shortly.");
  return NextResponse.redirect(signInUrl);
}

/* First line of defense: refresh the Supabase session cookie and redirect
   signed-out visitors to /sign-in. API routes ALSO check the session
   themselves via requireUser() — never rely on middleware alone. */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* Operator-first: always send the root URL to the ops console. */
  if (pathname === "/" || pathname === "") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard/";
    dashboardUrl.search = "";
    return applySecurityHeaders(NextResponse.redirect(dashboardUrl));
  }

  /* No auth env configured → open mock/dev mode, nothing to do. */
  if (!isAuthConfigured()) return applySecurityHeaders(NextResponse.next());

  const isSignInPage = pathname === "/sign-in" || pathname === "/sign-in/";
  const isPreviewStylesheet =
    pathname === "/api/studio/template/css" || pathname === "/api/studio/template/css/";
  /* Public liveness probe for the Training Unit command center — returns only
     ok/db/latencyMs, no secrets. Must stay ungated or external monitors 401. */
  const isPublicHealth = pathname === "/api/health" || pathname === "/api/health/";
  /* The OAuth callback runs BEFORE a session exists — it's what establishes
     one. Gating it behind sign-in would trap the user in a redirect loop. */
  const isAuthCallback = pathname === "/auth/callback" || pathname === "/auth/callback/";

  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseAuthEnv();
  if (!url || !anonKey) return applySecurityHeaders(response);

  let supabase: ReturnType<typeof createServerClient>;
  try {
    supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
  } catch {
    if (isSignInPage || isPreviewStylesheet || isPublicHealth || isAuthCallback) {
      return applySecurityHeaders(response);
    }
    return applySecurityHeaders(authUnavailable(request));
  }

  if (isPreviewStylesheet || isPublicHealth || isAuthCallback)
    return applySecurityHeaders(response);

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    if (isSignInPage) return applySecurityHeaders(response);
    return applySecurityHeaders(authUnavailable(request));
  }

  if (!user && !isSignInPage) {
    /* API callers get the standard error envelope, not an HTML redirect. */
    if (pathname.startsWith("/api/")) {
      return applySecurityHeaders(
        NextResponse.json(
          { ok: false, error: { message: "Sign-in required.", status: 401 } },
          { status: 401 },
        ),
      );
    }
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.search = "";
    return applySecurityHeaders(NextResponse.redirect(signInUrl));
  }

  if (user && isSignInPage) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/dashboard/";
    homeUrl.search = "";
    return applySecurityHeaders(NextResponse.redirect(homeUrl));
  }

  return applySecurityHeaders(response);
}

export const config = {
  /* Everything except Next internals and the public PWA assets
     (manifest, icons, service worker) needed before sign-in. */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icon\\.svg|icon-192\\.png|icon-512\\.png).*)",
  ],
};
