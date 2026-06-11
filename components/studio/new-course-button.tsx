"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import type { ApiResponse } from "@/types/api";
import type { CourseDraft } from "@/types/studio";

export function NewCourseButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/studio/drafts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseTitle: title.trim() }),
      });
      const body = (await response.json()) as ApiResponse<CourseDraft>;
      if (body.ok) {
        router.push(`/course-studio/${body.data.id}/`);
      } else {
        setError(body.error.message);
        setBusy(false);
      }
    } catch {
      setError("Could not create the draft.");
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        New course
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void create();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Course title…"
        className="w-64 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <button type="button" onClick={() => void create()} disabled={busy || !title.trim()} className="btn-primary">
        {busy ? "Creating…" : "Create"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
        Cancel
      </button>
      {error ? <StatusBadge tone="error">{error}</StatusBadge> : null}
    </span>
  );
}
