import { ConnectionCard } from "@/components/settings/connection-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getBrightspaceConfigHealth } from "@/lib/brightspace/config";
import { dataModeLabel, getDataMode } from "@/lib/data/mode";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  /* Booleans only — env var values never leave the server. */
  const bs = getBrightspaceConfigHealth();
  const dataMode = getDataMode();
  const supabaseUrlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKeySet = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <>
      <PageHeader
        eyebrow="Infrastructure · Settings"
        title="Settings"
        description="API connection status. Credentials live in environment variables on the server. Values are never shown here or sent to the browser."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="editorial-card px-5 py-4 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-bold text-ink">Data mode</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                Controls whether fixture-backed screens are allowed. Use live required when the
                course pilot starts so missing live integrations stop visibly instead of falling
                back to demo data.
              </p>
            </div>
            <StatusBadge tone={dataMode === "live_required" ? "error" : "info"}>
              {dataModeLabel(dataMode)}
            </StatusBadge>
          </div>
          <ul className="mt-4 space-y-1.5 border-t border-line-soft pt-3 text-sm">
            <li className="flex items-center justify-between gap-2">
              <code className="font-mono text-xs text-ink-muted">APP_DATA_MODE</code>
              <code className="font-mono text-xs text-ink-soft">{dataMode}</code>
            </li>
          </ul>
        </section>
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
          By default, the app runs in hybrid mode: live data when configured, realistic mock data
          otherwise, always with an amber banner. Set{" "}
          <code className="font-mono text-xs">APP_DATA_MODE=live_required</code> for the pilot to
          disable every fixture fallback.
        </p>
        <p className="mt-2">
          To go live later: register an OAuth app in Brightspace (Admin Tools → Manage
          Extensibility), set the variables above in{" "}
          <code className="font-mono text-xs">.env.local</code>, and restart the app. The
          service-user (client-credentials) sync flow is the next integration milestone.
        </p>
        <p className="mt-4 font-mono text-xs text-ink-soft">
          Brightspace Manager v0.1 · read-only milestone
        </p>
      </section>
    </>
  );
}
