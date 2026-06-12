import { createBrowserClient } from "@supabase/ssr";

/* Browser-side Supabase client used only for sign-in/sign-out. Data never
   flows through this client — all reads go via our own API routes, which use
   the server-only service-role client. The anon key is safe to expose. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
