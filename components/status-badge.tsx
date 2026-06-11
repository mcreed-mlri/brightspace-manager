export type BadgeTone = "ok" | "info" | "warn" | "error" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  ok: "bg-status-ok-soft text-status-ok-ink",
  info: "bg-status-info-soft text-status-info-ink",
  warn: "bg-status-warn-soft text-status-warn-ink",
  error: "bg-status-error-soft text-status-error-ink",
  neutral: "bg-status-neutral-soft text-status-neutral-ink",
};

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
