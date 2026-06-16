"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";
import { formatRelative } from "@/components/courses/course-presentation";
import type { ApiResponse } from "@/types/api";
import type { DraftSummary } from "@/types/studio";

/* Client list of Course Studio drafts. Each row links into the builder; a
   muted trash button (red on hover) gates deletion behind ConfirmDialog. On
   success we router.refresh() so the server component re-lists from disk. */
export function CourseList({ drafts }: { drafts: DraftSummary[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<DraftSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/studio/drafts/${pending.id}/`, { method: "DELETE" });
      const body = (await response.json()) as ApiResponse<{ id: string }>;
      if (body.ok) {
        setPending(null);
        router.refresh();
      } else {
        setError(body.error.message);
      }
    } catch {
      setError("Could not delete the course.");
    } finally {
      setDeleting(false);
    }
  }

  if (drafts.length === 0) {
    return (
      <p className="px-5 py-5 text-[13px] text-ink-muted">
        No courses yet. Hit <strong>+ New course</strong> to open a blank builder for a guided
        form with a live preview of what learners will see.
      </p>
    );
  }

  return (
    <>
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="group flex items-center gap-[13px] border-b border-line-soft px-5 py-3.5 transition-colors last:border-b-0 hover:bg-hover"
        >
          <Link href={`/course-studio/${draft.id}/`} className="flex min-w-0 flex-1 items-center gap-[13px]">
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-ink-soft" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">
                {draft.courseTitle}
              </span>
              <span className="block text-xs text-ink-soft">
                {draft.topicCount} lesson{draft.topicCount === 1 ? "" : "s"} ·{" "}
                {draft.totalMinutes} min · edited {formatRelative(draft.updatedAt)}
              </span>
            </span>
          </Link>
          <StatusBadge tone="neutral">draft</StatusBadge>
          <button
            type="button"
            aria-label={`Delete ${draft.courseTitle}`}
            title="Delete course"
            onClick={() => setPending(draft)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-soft opacity-0 transition-colors hover:bg-status-error-soft hover:text-status-error-ink focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2.5 4h11M6 4V2.5h4V4M4.5 4l.6 9h5.8l.6-9M6.5 6.5v4M9.5 6.5v4" />
            </svg>
          </button>
          <Link
            href={`/course-studio/${draft.id}/`}
            className="shrink-0 text-[13px] font-semibold text-brand"
          >
            Open →
          </Link>
        </div>
      ))}

      <ConfirmDialog
        open={pending !== null}
        title={`Delete "${pending?.courseTitle ?? ""}"?`}
        message={
          <>
            This permanently removes the course and its{" "}
            {pending?.topicCount ?? 0} lesson{pending?.topicCount === 1 ? "" : "s"}. This can&apos;t
            be undone.
            {error ? <span className="mt-2 block text-status-error-ink">{error}</span> : null}
          </>
        }
        confirmLabel={deleting ? "Deleting…" : "Delete course"}
        onCancel={() => {
          if (deleting) return;
          setPending(null);
          setError(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
