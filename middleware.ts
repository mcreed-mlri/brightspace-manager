import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isAuthConfigured } from "@/lib/auth/config";

/* First line of defense: refresh the Supabase session cookie and redirect
   signed-out visitors to /sign-in. API routes ALSO check the session
   themselves via requireUser() — never rely on middleware alone. */

export async function middleware(request: NextRequest) {
  /* No auth env configured → open mock/dev mode, nothing to do. */
  if (!isAuthConfigured()) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isSignInPage = pathname === "/sign-in" || pathname === "/sign-in/";

  if (!user && !isSignInPage) {
    /* API callers get the standard error envelope, not an HTML redirect. */
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: { message: "Sign-in required.", status: 401 } },
        { status: 401 },
      );
    }
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.search = "";
    return NextResponse.redirect(signInUrl);
  }

  if (user && isSignInPage) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  /* Everything except Next internals and the public PWA assets
     (manifest, icons, service worker) needed before sign-in. */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icon\\.svg|icon-192\\.png|icon-512\\.png).*)",
  ],
};
