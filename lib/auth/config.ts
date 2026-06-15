/* Shared by middleware, server helpers, and client components — keep this
   dependency-free (no server-only, no next/headers).

   Auth is opt-in: with no Supabase auth env vars the app runs open in
   mock/dev mode, matching the project's "everything optional" env philosophy.
   NEXT_PUBLIC_ values are exposed to the browser, but server/middleware code
   still needs to tolerate partial or missing runtime env without throwing. */

export function getSupabaseAuthEnv() {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "";
  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  };
}

export function isAuthConfigured(): boolean {
  return getSupabaseAuthEnv().configured;
}
