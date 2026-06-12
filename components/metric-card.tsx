import type { ReactNode } from "react";

/* Metric card per design handoff v3: micro label, big mono value, soft sub.
   `warn` tints the value when the number itself is the warning. */
export function MetricCard({
  label,
  value,
  sub,
  badge,
  warn = false,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  badge?: ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="editorial-card relative px-5 py-[18px]">
      <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-ink-soft">
        {label}
      </p>
      <div
        className={`font-mono text-[28px] font-extrabold leading-none tracking-[-0.03em] ${
          warn ? "text-status-warn" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sub ? <p className="mt-1 text-xs text-ink-soft">{sub}</p> : null}
      {badge ? <div className="absolute right-4 top-4">{badge}</div> : null}
    </div>
  );
}
