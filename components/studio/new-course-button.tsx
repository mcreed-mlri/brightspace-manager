"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiResponse } from "@/types/api";
import type { CourseDraft } from "@/types/studio";

/* Design handoff v3: "+ Start a new course" opens a blank builder right
   away — no title prompt. The title is edited in the builder top bar. */
export function NewCourseButton({
  label = "+ New course",
  className = "btn-primary",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/studio/drafts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseTitle: "Untitled course" }),
      });
      const body = (await response.json()) as ApiResponse<CourseDraft>;
      if (body.ok) {
        router.push(`/course-studio/${body.data.id}/?details=1`);
      } else {
        setError(body.error.message);
        setBusy(false);
      }
    } catch {
      setError("Could not create the draft.");
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={() => void create()} disabled={busy} className={className}>
        {busy ? "Creating…" : label}
      </button>
      {error ? <span className="text-xs text-status-error-ink">{error}</span> : null}
    </span>
  );
}
