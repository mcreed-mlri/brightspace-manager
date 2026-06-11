import Link from "next/link";
import { IconWarning } from "@/components/icons";

/* Non-dismissable by design: admins must never mistake fixtures for live
   Brightspace data. Rendered wherever a DataResult has source === "mock". */
export function MockDataBanner() {
  return (
    <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-status-warn/30 bg-status-warn-soft px-4 py-2.5 text-sm text-status-warn-ink">
      <IconWarning size={16} className="shrink-0" />
      <span>
        Showing <strong>mock data</strong> — Brightspace credentials are not configured.{" "}
        <Link href="/settings/" className="font-medium underline underline-offset-2">
          Open Settings
        </Link>
      </span>
    </div>
  );
}
