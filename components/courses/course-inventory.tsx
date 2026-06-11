"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { IconExternal, IconSearch } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { missingMetadata, type CourseOffering, type SyncState } from "@/types/domain";
import { CourseDrawer } from "@/components/courses/course-drawer";
import { formatRelative, SYNC_TONE } from "@/components/courses/course-presentation";

type StatusFilter = "all" | "active" | "archived";
type SortKey = "name" | "orgUnitId" | "lastSyncedAt";

const SYNC_FILTERS: { value: SyncState | "all"; label: string }[] = [
  { value: "all", label: "Any sync state" },
  { value: "synced", label: "Synced" },
  { value: "stale", label: "Stale" },
  { value: "never-synced", label: "Never synced" },
];

function uniqueValues(courses: CourseOffering[], key: "jurisdiction" | "program"): string[] {
  return [...new Set(courses.map((c) => c[key]).filter((v): v is string => Boolean(v)))].sort();
}

export function CourseInventory({ courses }: { courses: CourseOffering[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [jurisdiction, setJurisdiction] = useState("all");
  const [program, setProgram] = useState("all");
  const [syncFilter, setSyncFilter] = useState<SyncState | "all">("all");
  const [missingOnly, setMissingOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<CourseOffering | null>(null);

  const jurisdictions = useMemo(() => uniqueValues(courses, "jurisdiction"), [courses]);
  const programs = useMemo(() => uniqueValues(courses, "program"), [courses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = courses.filter((c) => {
      if (q) {
        const haystack = `${c.name} ${c.code} ${c.orgUnitId}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (status === "active" && !c.isActive) return false;
      if (status === "archived" && c.isActive) return false;
      if (jurisdiction !== "all" && c.jurisdiction !== jurisdiction) return false;
      if (program !== "all" && c.program !== program) return false;
      if (syncFilter !== "all" && c.syncState !== syncFilter) return false;
      if (missingOnly && missingMetadata(c).length === 0) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "orgUnitId") cmp = a.orgUnitId - b.orgUnitId;
      else {
        const at = a.lastSyncedAt ? new Date(a.lastSyncedAt).getTime() : 0;
        const bt = b.lastSyncedAt ? new Date(b.lastSyncedAt).getTime() : 0;
        cmp = at - bt;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [courses, query, status, jurisdiction, program, syncFilter, missingOnly, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setJurisdiction("all");
    setProgram("all");
    setSyncFilter("all");
    setMissingOnly(false);
  }

  const hasFilters =
    query !== "" ||
    status !== "all" ||
    jurisdiction !== "all" ||
    program !== "all" ||
    syncFilter !== "all" ||
    missingOnly;

  const selectClass =
    "rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/30";

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null;
    return <span aria-hidden> {sortAsc ? "↑" : "↓"}</span>;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <label className="relative">
          <IconSearch
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, code, or org unit ID"
            className="w-72 rounded-lg border border-line bg-surface py-1.5 pl-9 pr-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className={selectClass}
          aria-label="Filter by jurisdiction"
        >
          <option value="all">All jurisdictions</option>
          {jurisdictions.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        <select
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className={selectClass}
          aria-label="Filter by program"
        >
          <option value="all">All programs</option>
          {programs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={syncFilter}
          onChange={(e) => setSyncFilter(e.target.value as SyncState | "all")}
          className={selectClass}
          aria-label="Filter by sync state"
        >
          {SYNC_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={missingOnly}
            onChange={(e) => setMissingOnly(e.target.checked)}
            className="accent-[var(--brand-fill)]"
          />
          Missing metadata
        </label>

        <span className="ml-auto font-mono text-xs text-ink-soft">
          {filtered.length} of {courses.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No courses match these filters">
          <p>Try broadening the search or clearing the filters.</p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 rounded-lg border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
            >
              Clear filters
            </button>
          ) : null}
        </EmptyState>
      ) : (
        <div className="editorial-card overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="text-[11px] font-medium uppercase tracking-wider text-ink-soft hover:text-ink"
                  >
                    Course{sortIndicator("name")}
                  </button>
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  Code
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("orgUnitId")}
                    className="text-[11px] font-medium uppercase tracking-wider text-ink-soft hover:text-ink"
                  >
                    Org Unit{sortIndicator("orgUnitId")}
                  </button>
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  Jurisdiction
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  Program
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  Status
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("lastSyncedAt")}
                    className="text-[11px] font-medium uppercase tracking-wider text-ink-soft hover:text-ink"
                  >
                    Last synced{sortIndicator("lastSyncedAt")}
                  </button>
                </th>
                <th className="px-4 py-3" aria-label="Brightspace link" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => {
                const missing = missingMetadata(course);
                return (
                  <tr
                    key={course.orgUnitId}
                    onClick={() => setSelected(course)}
                    className="cursor-pointer border-b border-line-soft transition-colors last:border-b-0 hover:bg-hover-tint"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      {course.name}
                      {missing.length > 0 ? (
                        <span className="ml-2 align-middle">
                          <StatusBadge tone="warn">missing {missing.length}</StatusBadge>
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                      {course.code || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                      {course.orgUnitId}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{course.jurisdiction ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{course.program ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={course.isActive ? "ok" : "neutral"}>
                        {course.isActive ? "Active" : "Archived"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {course.lastSyncedAt ? (
                        <span title={course.lastSyncedAt}>
                          {formatRelative(course.lastSyncedAt)}
                        </span>
                      ) : (
                        <StatusBadge tone={SYNC_TONE[course.syncState]}>never</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={course.brightspaceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Open ${course.name} in Brightspace`}
                        title="Open in Brightspace"
                        className="inline-flex rounded p-1 text-ink-soft transition-colors hover:bg-surface-sunken hover:text-brand"
                      >
                        <IconExternal size={15} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CourseDrawer course={selected} onClose={() => setSelected(null)} />
    </>
  );
}
