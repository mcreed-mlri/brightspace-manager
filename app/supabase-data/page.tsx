import { EmptyState } from "@/components/empty-state";
import { IconDatabase } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { previewLearningItems } from "@/lib/data/learning-items";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SupabaseDataPage() {
  const configured = isSupabaseConfigured();
  const items = configured ? await previewLearningItems(10) : null;

  return (
    <>
      <PageHeader
        title="Supabase Data"
        description="Read-only inspector for the Supabase cache layer — learning_items first, with jurisdictions, programs, and tags to follow."
        actions={<StatusBadge tone="info">Read-only</StatusBadge>}
      />

      {items && items.length > 0 ? (
        <div className="editorial-card overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {["Title", "Type", "Provider course", "Practice area", "Synced"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line-soft last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{item.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{item.item_type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                    {item.provider_course_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{item.practice_area ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                    {item.synced_at ? item.synced_at.slice(0, 10) : "never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line-soft px-4 py-2.5 text-xs text-ink-soft">
            Live preview — 10 most recently updated learning_items rows.
          </p>
        </div>
      ) : (
        <EmptyState
          icon={<IconDatabase size={28} />}
          title={configured ? "No rows in learning_items yet" : "Supabase is not connected"}
        >
          {configured ? (
            <p>The cache table is reachable but empty. Run a Brightspace sync to populate it.</p>
          ) : (
            <>
              <p>
                Once Supabase credentials are configured in Settings, this tab becomes a searchable,
                filterable browser for the cache tables:
              </p>
              <ul className="mt-2 list-inside list-disc text-left">
                <li>learning_items — the course catalog cache</li>
                <li>jurisdictions, programs, and tags</li>
                <li>tracking and usage data, when available</li>
              </ul>
              <p className="mt-2">
                Views stay read-only — no destructive SQL from this UI, ever.
              </p>
            </>
          )}
        </EmptyState>
      )}
    </>
  );
}
