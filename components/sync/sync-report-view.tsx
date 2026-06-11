"use client";

import { useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import type { ApiResponse } from "@/types/api";
import type { DataSource, DiagnosticState, SyncReport } from "@/types/domain";
import { formatRelative } from "@/components/courses/course-presentation";

const STATE_TONE: Record<DiagnosticState, BadgeTone> = {
  healthy: "ok",
  "needs-review": "warn",
  broken: "error",
  unknown: "neutral",
};

const STATE_LABEL: Record<DiagnosticState, string> = {
  healthy: "Healthy",
  "needs-review": "Needs review",
  broken: "Broken",
  unknown: "Unknown",
};

export function SyncReportView({
  initialReport,
  initialSource,
}: {
  initialReport: SyncReport;
  initialSource: DataSource;
}) {
  const [report, setReport] = useState(initialReport);
  const [source, setSource] = useState<DataSource>(initialSource);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runCheck() {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/sync/check/", { cache: "no-store" });
      const body = (await response.json()) as ApiResponse<SyncReport>;
      if (body.ok) {
        setReport(body.data);
        setSource(body.source);
      } else {
        setError(body.error.message);
      }
    } catch {
      setError("Could not reach the sync check route.");
    } finally {
      setRunning(false);
    }
  }

  const flagged = report.diagnostics.filter((d) => d.state !== "healthy");
  const healthyOnly = flagged.length === 0 && report.orphans.length === 0;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void runCheck()}
          disabled={running}
          className="rounded-lg bg-brand-fill px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {running ? "Checking…" : "Run Sync Check"}
        </button>
        <span className="font-mono text-xs text-ink-soft">
          last run {formatRelative(report.ranAt)} · {source} data
        </span>
        {error ? <StatusBadge tone="error">{error}</StatusBadge> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="In Brightspace"
          value={report.coursesInBrightspace}
          sub="Course offerings (system of record)"
        />
        <MetricCard
          label="In Supabase"
          value={report.coursesInSupabase}
          sub="learning_items cache rows"
        />
        <MetricCard
          label="Healthy"
          value={report.healthy}
          badge={<StatusBadge tone="ok">in sync</StatusBadge>}
        />
        <MetricCard
          label="Flagged"
          value={report.needsReview + report.broken + report.orphans.length}
          sub={`${report.broken} broken · ${report.needsReview} need review · ${report.orphans.length} orphaned`}
          badge={
            healthyOnly ? (
              <StatusBadge tone="ok">all clear</StatusBadge>
            ) : (
              <StatusBadge tone="warn">attention</StatusBadge>
            )
          }
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-ink">Course diagnostics</h2>
        <div className="editorial-card overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  Course
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  Org Unit
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  State
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  Issues
                </th>
              </tr>
            </thead>
            <tbody>
              {report.diagnostics.map((diag) => (
                <tr key={diag.orgUnitId} className="border-b border-line-soft align-top last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{diag.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{diag.orgUnitId}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={STATE_TONE[diag.state]}>
                      {STATE_LABEL[diag.state]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {diag.issues.length === 0 ? (
                      <span className="text-ink-soft">—</span>
                    ) : (
                      <ul className="list-inside list-disc space-y-0.5">
                        {diag.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {report.orphans.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-base font-semibold text-ink">Orphaned Supabase rows</h2>
          <div className="editorial-card divide-y divide-line-soft">
            {report.orphans.map((orphan) => (
              <div key={orphan.providerCourseId} className="flex items-center gap-3 px-5 py-3">
                <StatusBadge tone="warn">orphan</StatusBadge>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{orphan.title}</p>
                  <p className="text-xs text-ink-muted">{orphan.reason}</p>
                </div>
                <span className="ml-auto font-mono text-xs text-ink-soft">
                  {orphan.providerCourseId}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Cleanup follows MLRI governance — archive, do not delete. Orphan handling will be a
            previewed, confirmed, logged action in a later milestone.
          </p>
        </section>
      ) : null}
    </>
  );
}
