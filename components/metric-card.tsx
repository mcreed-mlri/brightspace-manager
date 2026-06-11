import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  sub,
  badge,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="editorial-card px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-soft">
          {label}
        </span>
        {badge}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold text-ink">{value}</div>
      {sub ? <p className="mt-1 text-xs text-ink-muted">{sub}</p> : null}
    </div>
  );
}
