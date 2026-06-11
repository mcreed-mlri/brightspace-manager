"use client";

import { useState } from "react";
import { FileTree } from "@/components/files/file-tree";
import { StatusBadge } from "@/components/status-badge";
import type { ApiResponse } from "@/types/api";
import type { CourseOffering, DataSource, FileNode } from "@/types/domain";

export function FilesBrowser({
  courses,
  initialOrgUnitId,
  initialTree,
  initialSource,
}: {
  courses: CourseOffering[];
  initialOrgUnitId: number;
  initialTree: FileNode;
  initialSource: DataSource;
}) {
  const [orgUnitId, setOrgUnitId] = useState(initialOrgUnitId);
  const [tree, setTree] = useState<FileNode | null>(initialTree);
  const [source, setSource] = useState<DataSource>(initialSource);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCourse = courses.find((c) => c.orgUnitId === orgUnitId);

  async function selectCourse(nextId: number) {
    setOrgUnitId(nextId);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/managefiles/tree/?orgUnitId=${nextId}`, {
        cache: "no-store",
      });
      const body = (await response.json()) as ApiResponse<FileNode>;
      if (body.ok) {
        setTree(body.data);
        setSource(body.source);
      } else {
        setTree(null);
        setError(body.error.message);
      }
    } catch {
      setTree(null);
      setError("Could not load the file tree.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-soft">
            Course
          </span>
          <select
            value={orgUnitId}
            onChange={(e) => void selectCourse(Number(e.target.value))}
            className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {courses.map((course) => (
              <option key={course.orgUnitId} value={course.orgUnitId}>
                {course.name}
              </option>
            ))}
          </select>
        </label>
        {selectedCourse ? (
          <span className="font-mono text-xs text-ink-soft">
            org unit {selectedCourse.orgUnitId}
          </span>
        ) : null}
        {loading ? <StatusBadge tone="info">Loading…</StatusBadge> : null}
        {source === "mock" && !loading ? <StatusBadge tone="warn">mock tree</StatusBadge> : null}
        {error ? <StatusBadge tone="error">{error}</StatusBadge> : null}
      </div>

      {tree ? <FileTree root={tree} /> : null}
    </>
  );
}
