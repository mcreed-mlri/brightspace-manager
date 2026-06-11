"use client";

import { useState } from "react";
import { Drawer } from "@/components/drawer";
import { IconCopy, IconExternal } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { missingMetadata, type CourseOffering } from "@/types/domain";
import { formatRelative, SYNC_TONE } from "@/components/courses/course-presentation";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-line-soft py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

export function CourseDrawer({
  course,
  onClose,
}: {
  course: CourseOffering | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!course) return null;
  const missing = missingMetadata(course);

  async function copyOrgUnitId() {
    if (!course) return;
    try {
      await navigator.clipboard.writeText(String(course.orgUnitId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — ignore.
    }
  }

  return (
    <Drawer open title={course.name} onClose={onClose}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge tone={course.isActive ? "ok" : "neutral"}>
          {course.isActive ? "Active" : "Archived"}
        </StatusBadge>
        <StatusBadge tone={SYNC_TONE[course.syncState]}>{course.syncState}</StatusBadge>
      </div>

      <dl>
        <Field
          label="Org Unit ID"
          value={
            <span className="flex items-center gap-2 font-mono">
              {course.orgUnitId}
              <button
                type="button"
                onClick={copyOrgUnitId}
                className="rounded p-1 text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
                aria-label="Copy org unit ID"
                title="Copy org unit ID"
              >
                <IconCopy size={14} />
              </button>
              {copied ? <span className="text-xs text-status-ok-ink">Copied</span> : null}
            </span>
          }
        />
        <Field label="Course code" value={course.code || <span className="text-ink-soft">—</span>} />
        <Field
          label="Jurisdiction"
          value={course.jurisdiction ?? <span className="text-ink-soft">Missing</span>}
        />
        <Field
          label="Program"
          value={course.program ?? <span className="text-ink-soft">Missing</span>}
        />
        <Field
          label="Last synced"
          value={
            course.lastSyncedAt ? (
              <span title={course.lastSyncedAt}>{formatRelative(course.lastSyncedAt)}</span>
            ) : (
              <span className="text-ink-soft">Never</span>
            )
          }
        />
      </dl>

      {missing.length > 0 ? (
        <div className="mt-4 rounded-lg border border-status-warn/30 bg-status-warn-soft px-3.5 py-2.5 text-sm text-status-warn-ink">
          Missing metadata: <strong>{missing.join(", ")}</strong>
        </div>
      ) : null}

      <a
        href={course.brightspaceUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-primary mt-6"
      >
        Open in Brightspace
        <IconExternal size={15} />
      </a>
    </Drawer>
  );
}
