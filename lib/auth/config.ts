/* Shared by middleware, server helpers, and client components — keep this
   dependency-free (no server-only, no next/headers).

   Auth is opt-in: with no Supabase auth env vars the app runs open in
   mock/dev mode, matching the project's "everything optional" env philosophy.
   NEXT_PUBLIC_ values are inlined at build time, so this works in the
   browser bundle too. */

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
