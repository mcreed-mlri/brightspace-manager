import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAuthEnv } from "@/lib/auth/config";
import { isAllowedOrgEmail } from "@/lib/auth/server";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";

/* OAuth landing point. Google (via Supabase) redirects the browser here with a
   one-time `?code=`; we trade it for a session cookie, then send the user on to
   the dashboard. On any failure we bounce back to /sign-in with a readable
   reason so a blocked/denied Google login degrades to the code-based fallback
   instead of a dead end. Trailing slashes are on (next.config.mjs), so the
   registered redirect URL must be /auth/callback/. */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  const failUrl = new URL("/sign-in/", origin);

  if (oauthError) {
    failUrl.searchParams.set("error", oauthError);
    return NextResponse.redirect(failUrl);
  }
  if (!code) {
    failUrl.searchParams.set("error", "Google sign-in returned no code. Try again.");
    return NextResponse.redirect(failUrl);
  }

  const { url, anonKey } = getSupabaseAuthEnv();
  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL("/dashboard/", origin));

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    failUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(failUrl);
  }

  /* Org-only enforcement. Google will authenticate anyone; we only let org
     domains keep a session. Returning failUrl (not `response`) means the
     session cookies set during the exchange never reach the browser, and we
     delete the auto-created account so no outsider row lingers in auth.users. */
  if (!isAllowedOrgEmail(data.user?.email)) {
    if (data.user && isSupabaseConfigured()) {
      try {
        await createSupabaseAdminClient().auth.admin.deleteUser(data.user.id);
      } catch (cleanupError) {
        console.warn("Could not remove rejected sign-in account.", cleanupError);
      }
    }
    failUrl.searchParams.set(
      "error",
      "That account isn't on the organization's domain, so it can't sign in here.",
    );
    return NextResponse.redirect(failUrl);
  }

  return response;
}
