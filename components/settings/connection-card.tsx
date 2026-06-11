"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import type { ApiResponse } from "@/types/api";
import type { HealthStatus } from "@/types/domain";

const STATE_TONE: Record<HealthStatus["status"], BadgeTone> = {
  ok: "ok",
  error: "error",
  unconfigured: "neutral",
};

const STATE_LABEL: Record<HealthStatus["status"], string> = {
  ok: "Connected",
  error: "Error",
  unconfigured: "Unconfigured",
};

export function ConnectionCard({
  title,
  endpoint,
  envVars,
}: {
  title: string;
  endpoint: string;
  /* Env var names with whether they are set — names only, never values. */
  envVars: { name: string; set: boolean }[];
}) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);

  const runCheck = useCallback(async () => {
    setChecking(true);
    setFailed(false);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const body = (await response.json()) as ApiResponse<HealthStatus>;
      if (body.ok) {
        setHealth(body.data);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setChecking(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  return (
    <div className="editorial-card px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {checking ? (
          <StatusBadge tone="info">Checking…</StatusBadge>
        ) : failed ? (
          <StatusBadge tone="error">Check failed</StatusBadge>
        ) : health ? (
          <StatusBadge tone={STATE_TONE[health.status]}>{STATE_LABEL[health.status]}</StatusBadge>
        ) : null}
      </div>

      {health?.detail ? <p className="mt-2 text-sm text-ink-muted">{health.detail}</p> : null}
      {health?.mode ? (
        <p className="mt-1 font-mono text-xs text-ink-soft">auth mode: {health.mode}</p>
      ) : null}

      <ul className="mt-4 space-y-1.5 border-t border-line-soft pt-3">
        {envVars.map((v) => (
          <li key={v.name} className="flex items-center justify-between gap-2 text-sm">
            <code className="font-mono text-xs text-ink-muted">{v.name}</code>
            <StatusBadge tone={v.set ? "ok" : "neutral"}>{v.set ? "set" : "not set"}</StatusBadge>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => void runCheck()}
        disabled={checking}
        className="mt-4 rounded-lg border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken disabled:opacity-50"
      >
        Re-check connection
      </button>
    </div>
  );
}
