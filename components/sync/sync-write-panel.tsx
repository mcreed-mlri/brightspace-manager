"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import type { ApiResponse } from "@/types/api";
import type { SyncAuditEntry, SyncPlan, SyncRunResult } from "@/types/domain";
import { formatRelative } from "@/components/courses/course-presentation";

/* Preview → confirm → result, per MLRI governance: no write without a
   previewed plan and an explicit confirmation click. */
export function SyncWritePanel({
  canWrite,
  recentRuns,
}: {
  canWrite: boolean;
  recentRuns: SyncAuditEntry[];
}) {
  const [plan, setPlan] = useState<SyncPlan | null>(null);
  const [result, setResult] = useState<SyncRunResult | null>(null);
  const [busy, setBusy] = useState<"plan" | "run" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPlan() {
    setBusy("plan");
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/sync/plan/", { cache: "no-store" });
      const body = (await response.json()) as ApiResponse<SyncPlan>;
      if (body.ok) setPlan(body.data);
      else setError(body.error.message);
    } catch {
      setError("Could not build the sync plan.");
    } finally {
      setBusy(null);
    }
  }

  async function runSync() {
    setBusy("run");
    setError(null);
    try {
      const response = await fetch("/api/sync/run/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const body = (await response.json()) as ApiResponse<SyncRunResult>;
      if (body.ok) {
        setResult(body.data);
        setPlan(null);
        /* Reload so the diagnostics report above reflects the new state. */
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setError(body.error.message);
      }
    } catch {
      setError("Sync run failed.");
    } finally {
      setBusy(null);
    }
  }

  const pendingCount = plan ? plan.toCreate.length + plan.toUpdate.length : 0;

  return (
    <section className="mt-8">
      <h2 className="section-title mb-3 text-ink">Sync to Supabase</h2>
      <div className="editorial-card px-5 py-4">
        <p className="text-sm text-ink-muted">
          Writes Brightspace course offerings into the Supabase{" "}
          <code className="font-mono text-xs">learning_items</code> cache. Upsert only — rows whose
          Brightspace course no longer exists are never touched. Every run is logged.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadPlan()}
            disabled={!canWrite || busy !== null}
            className="btn-secondary"
          >
            {busy === "plan" ? "Building preview…" : "Preview sync"}
          </button>
          {plan && pendingCount > 0 ? (
            <button
              type="button"
              onClick={() => void runSync()}
              disabled={busy !== null}
              className="btn-primary"
            >
              {busy === "run"
                ? "Syncing…"
                : `Confirm & sync ${pendingCount} course${pendingCount === 1 ? "" : "s"}`}
            </button>
          ) : null}
          {!canWrite ? (
            <StatusBadge tone="neutral">requires live Brightspace + Supabase</StatusBadge>
          ) : null}
          {error ? <StatusBadge tone="error">{error}</StatusBadge> : null}
        </div>

        {plan ? (
          <div className="mt-4 border-t border-line-soft pt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusBadge tone={plan.toCreate.length > 0 ? "info" : "neutral"}>
                {plan.toCreate.length} to create
              </StatusBadge>
              <StatusBadge tone={plan.toUpdate.length > 0 ? "warn" : "neutral"}>
                {plan.toUpdate.length} to update
              </StatusBadge>
              <StatusBadge tone="ok">{plan.unchanged} unchanged</StatusBadge>
              {plan.orphansLeftAlone > 0 ? (
                <StatusBadge tone="neutral">{plan.orphansLeftAlone} orphans left alone</StatusBadge>
              ) : null}
            </div>

            {pendingCount === 0 ? (
              <p className="text-sm text-ink-muted">
                Everything is in sync — nothing to write.
              </p>
            ) : (
              <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-2">
                {[...plan.toCreate, ...plan.toUpdate].map((item) => (
                  <li key={item.orgUnitId} className="flex items-start gap-2.5 text-sm">
                    <StatusBadge tone={item.action === "create" ? "info" : "warn"}>
                      {item.action}
                    </StatusBadge>
                    <span className="min-w-0">
                      <span className="font-medium text-ink">{item.name}</span>{" "}
                      <span className="font-mono text-xs text-ink-soft">{item.orgUnitId}</span>
                      <span className="block text-xs text-ink-muted">
                        {item.changes.join("; ")}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {result ? (
          <div className="mt-4 border-t border-line-soft pt-4">
            <StatusBadge tone={result.failed > 0 ? "error" : "ok"}>
              {result.failed > 0
                ? `${result.failed} failed`
                : `synced — ${result.created} created, ${result.updated} updated`}
            </StatusBadge>
            {result.errors.map((message) => (
              <p key={message} className="mt-2 text-xs text-status-error-ink">
                {message}
              </p>
            ))}
            {result.failed === 0 ? (
              <p className="mt-2 text-xs text-ink-muted">Refreshing diagnostics…</p>
            ) : null}
          </div>
        ) : null}

        {recentRuns.length > 0 ? (
          <div className="mt-4 border-t border-line-soft pt-3">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
              Recent sync runs
            </p>
            <ul className="space-y-1">
              {recentRuns.map((run) => (
                <li key={run.ranAt} className="font-mono text-xs text-ink-muted">
                  {formatRelative(run.ranAt)} — {run.created} created, {run.updated} updated
                  {run.failed > 0 ? `, ${run.failed} failed` : ""}
                  {run.actor ? ` · by ${run.actor}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
