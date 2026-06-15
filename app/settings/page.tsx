import { ConnectionCard } from "@/components/settings/connection-card";
import { PageHeader } from "@/components/page-header";
import { getBrightspaceConfigHealth } from "@/lib/brightspace/config";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  /* Booleans only — env var values never leave the server. */
  const bs = getBrightspaceConfigHealth();
  const supabaseUrlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKeySet = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <>
      <PageHeader
        eyebrow="Under the hood · Settings"
        title="Settings"
        description="API connection status. Credentials live in environment variables on the server — values are never shown here or sent to the browser."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConnectionCard
          title="Brightspace"
          endpoint="/api/health/brightspace/"
          envVars={[
            { name: "BRIGHTSPACE_BASE_URL", set: bs.baseUrl },
            { name: "BRIGHTSPACE_CLIENT_ID", set: bs.clientId },
            { name: "BRIGHTSPACE_CLIENT_SECRET", set: bs.clientSecret },
            { name: "BRIGHTSPACE_ACCESS_TOKEN", set: bs.accessToken },
          ]}
        />
        <ConnectionCard
          title="Supabase"
          endpoint="/api/health/supabase/"
          envVars={[
            { name: "NEXT_PUBLIC_SUPABASE_URL", set: supabaseUrlSet },
            { name: "SUPABASE_SERVICE_ROLE_KEY", set: supabaseKeySet },
          ]}
        />
      </div>

      <section className="mt-8 max-w-2xl text-sm text-ink-muted">
        <h2 className="section-title mb-2 text-ink">About mock mode</h2>
        <p>
          With no credentials configured, every page runs on realistic mock data and shows an amber
          banner. Brightspace stays the system of record: this app reads through secure server-side
          routes, never from the browser, and Milestone 1 contains no write actions at all.
        </p>
        <p className="mt-2">
          To go live later: register an OAuth app in Brightspace (Admin Tools → Manage
          Extensibility), set the variables above in <code className="font-mono text-xs">.env.local</code>,
          and restart the app. The service-user (client-credentials) sync flow is the next
          integration milestone.
        </p>
        <p className="mt-4 font-mono text-xs text-ink-soft">Brightspace Manager v0.1 · read-only milestone</p>
      </section>
    </>
  );
}
