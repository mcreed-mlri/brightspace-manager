import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

export function LiveDataRequiredPanel({ message }: { message: string }) {
  return (
    <div className="editorial-card px-5 py-5">
      <div className="mb-3 flex items-center gap-2">
        <StatusBadge tone="error">Live data required</StatusBadge>
        <code className="font-mono text-[11px] text-ink-soft">APP_DATA_MODE=live_required</code>
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">{message}</p>
      <p className="mt-3 text-sm text-ink-muted">
        Configure the live source for this area, or switch back to{" "}
        <code className="font-mono text-xs">APP_DATA_MODE=hybrid</code> while demos are still in
        progress.{" "}
        <Link href="/settings/" className="font-medium text-accent underline underline-offset-2">
          Open Settings
        </Link>
      </p>
    </div>
  );
}
