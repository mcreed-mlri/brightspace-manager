"use client";

import { useMemo, useState } from "react";
import { Drawer } from "@/components/drawer";
import { EmptyState } from "@/components/empty-state";
import { IconSearch } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { downloadCsv, toCsv } from "@/lib/csv";
import type { DataSource } from "@/types/domain";

export type BrowserTable = {
  key: string;
  label: string;
  description: string;
  /* Columns shown in the grid; the row drawer shows every field. */
  columns: string[];
  rows: Record<string, unknown>[];
  source: DataSource;
};

function cellText(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function DataBrowser({ tables }: { tables: BrowserTable[] }) {
  const [activeKey, setActiveKey] = useState(tables[0]?.key ?? "");
  const [query, setQuery] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);

  const table = tables.find((t) => t.key === activeKey) ?? tables[0];

  const filtered = useMemo(() => {
    if (!table) return [];
    const q = query.trim().toLowerCase();
    let rows = q
      ? table.rows.filter((row) =>
          Object.values(row).some((value) => cellText(value).toLowerCase().includes(q)),
        )
      : table.rows;

    if (sortCol) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortCol];
        const bv = b[sortCol];
        let cmp: number;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = cellText(av).localeCompare(cellText(bv));
        return sortAsc ? cmp : -cmp;
      });
    }
    return rows;
  }, [table, query, sortCol, sortAsc]);

  if (!table) return null;

  function selectTable(key: string) {
    setActiveKey(key);
    setQuery("");
    setSortCol(null);
    setSortAsc(true);
  }

  function toggleSort(col: string) {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(true);
    }
  }

  function exportCsv() {
    const allColumns = filtered.length > 0 ? Object.keys(filtered[0]) : table.columns;
    downloadCsv(`${table.key}.csv`, toCsv(filtered, allColumns));
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tables.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTable(t.key)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-xs font-medium transition-colors ${
              t.key === table.key
                ? "border-brand bg-brand-tint text-brand-ink"
                : "border-line bg-surface text-ink-muted hover:bg-surface-sunken"
            }`}
          >
            {t.label}
            {t.source === "mock" ? " · mock" : ""}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-ink-muted">{table.description}</p>

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
            placeholder={`Search ${table.label}`}
            className="w-72 rounded-lg border border-line bg-surface py-1.5 pl-9 pr-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="rounded-lg border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken disabled:opacity-50"
        >
          Export CSV
        </button>
        <span className="ml-auto font-mono text-xs text-ink-soft">
          {filtered.length} of {table.rows.length} rows
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No rows match">
          <p>Try a different search.</p>
        </EmptyState>
      ) : (
        <div className="editorial-card overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {table.columns.map((col) => (
                  <th key={col} className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink-soft hover:text-ink"
                    >
                      {col}
                      {sortCol === col ? <span aria-hidden> {sortAsc ? "↑" : "↓"}</span> : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr
                  key={cellText(row.id ?? index)}
                  onClick={() => setSelectedRow(row)}
                  className="cursor-pointer border-b border-line-soft transition-colors last:border-b-0 hover:bg-hover-tint"
                >
                  {table.columns.map((col) => (
                    <td key={col} className="max-w-xs truncate px-4 py-3 text-ink-muted">
                      {cellText(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={selectedRow !== null}
        title={`${table.label} row`}
        onClose={() => setSelectedRow(null)}
      >
        {selectedRow ? (
          <>
            <div className="mb-3">
              <StatusBadge tone={table.source === "live" ? "ok" : "warn"}>
                {table.source === "live" ? "live row" : "mock row"}
              </StatusBadge>
            </div>
            <dl>
              {Object.entries(selectedRow).map(([key, value]) => (
                <div key={key} className="border-b border-line-soft py-2.5">
                  <dt className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                    {key}
                  </dt>
                  <dd className="mt-0.5 break-words text-sm text-ink">{cellText(value)}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
