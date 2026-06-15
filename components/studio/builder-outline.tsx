"use client";

import { useEffect, useRef, useState } from "react";
import type { ModuleDraft, TopicDraft } from "@/types/studio";
import { SECTION_ORDER, sectionsWithContent } from "@/components/studio/builder-blocks";

/* Pane 1 — lesson outline. 258px, collapses to a 44px number rail. Each
   expanded row shows the lesson's type/length and how built-out it is, and
   reveals a ⋯ menu (Duplicate / Move / Delete) on hover. */

export function BuilderOutline({
  modules,
  selectedSlug,
  collapsed,
  onToggleCollapsed,
  onSelect,
  onRenameModule,
  onAddLesson,
  onAddModule,
  onMoveLesson,
  onDuplicateLesson,
  onDeleteLesson,
}: {
  modules: ModuleDraft[];
  selectedSlug: string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (slug: string) => void;
  onRenameModule: (moduleId: string, title: string) => void;
  onAddLesson: (moduleId: string) => void;
  onAddModule: () => void;
  onMoveLesson: (slug: string, delta: number) => void;
  onDuplicateLesson: (slug: string) => void;
  onDeleteLesson: (slug: string) => void;
}) {
  const total = modules.reduce((sum, mod) => sum + mod.topics.length, 0);

  return (
    <div
      className={`flex shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-[width] duration-200 ${
        collapsed ? "w-11" : "w-[258px]"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 border-b border-line py-2.5 ${
          collapsed ? "justify-center px-1" : "justify-between pl-4 pr-3"
        }`}
      >
        {!collapsed ? (
          <>
            <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Lessons
            </span>
            <span className="ml-auto text-[11px] text-ink-soft">{total} total</span>
          </>
        ) : null}
        <button
          type="button"
          onClick={onToggleCollapsed}
          title={collapsed ? "Expand lessons panel" : "Collapse lessons panel"}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            {collapsed ? <path d="M5 2l4 5-4 5" /> : <path d="M9 2L5 7l4 5" />}
          </svg>
        </button>
      </div>

      <div
        className={`flex-1 overflow-y-auto ${
          collapsed ? "flex flex-col items-center gap-0.5 px-0 py-2" : "p-2.5"
        }`}
      >
        {modules.map((mod) => (
          <div key={mod.id} className={collapsed ? "contents" : "mb-1.5"}>
            {!collapsed ? (
              <input
                value={mod.title}
                onChange={(e) => onRenameModule(mod.id, e.target.value)}
                aria-label="Module title"
                className="w-full border-none bg-transparent px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.09em] text-ink-soft outline-none focus:text-ink-muted"
              />
            ) : null}
            {mod.topics.map((topic, index) =>
              collapsed ? (
                <CollapsedRow
                  key={topic.slug}
                  topic={topic}
                  index={index}
                  active={topic.slug === selectedSlug}
                  onSelect={onSelect}
                />
              ) : (
                <LessonRow
                  key={topic.slug}
                  topic={topic}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === mod.topics.length - 1}
                  active={topic.slug === selectedSlug}
                  onSelect={onSelect}
                  onMove={onMoveLesson}
                  onDuplicate={onDuplicateLesson}
                  onDelete={onDeleteLesson}
                />
              ),
            )}
            {!collapsed ? (
              <button
                type="button"
                onClick={() => onAddLesson(mod.id)}
                className="flex w-full items-center gap-[5px] rounded-md py-[5px] pl-3.5 pr-2 text-left text-xs font-medium text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink-muted"
              >
                + Add lesson
              </button>
            ) : null}
          </div>
        ))}
        {!collapsed ? (
          <button
            type="button"
            onClick={onAddModule}
            className="mt-1.5 flex w-full items-center gap-[5px] border-t border-line-soft px-2 py-2 text-left text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink-muted"
          >
            + Add module
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* Collapsed 44px rail: just the lesson number. */
function CollapsedRow({
  topic,
  index,
  active,
  onSelect,
}: {
  topic: TopicDraft;
  index: number;
  active: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(topic.slug)}
      title={topic.title || topic.slug}
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-md text-xs font-bold transition-colors duration-100 ${
        active
          ? "bg-brand-tint text-brand"
          : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
      }`}
    >
      {index + 1}
    </button>
  );
}

function LessonRow({
  topic,
  index,
  isFirst,
  isLast,
  active,
  onSelect,
  onMove,
  onDuplicate,
  onDelete,
}: {
  topic: TopicDraft;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  active: boolean;
  onSelect: (slug: string) => void;
  onMove: (slug: string, delta: number) => void;
  onDuplicate: (slug: string) => void;
  onDelete: (slug: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  const sectionCount = sectionsWithContent(topic).length;
  const present = new Set(sectionsWithContent(topic));
  const flagged = topic.updated !== "";

  return (
    <div ref={wrapRef} className="group relative">
      <button
        type="button"
        onClick={() => onSelect(topic.slug)}
        title={topic.title || topic.slug}
        className={`flex w-full items-start gap-2 rounded-[7px] py-2 pl-3 pr-8 text-left transition-colors duration-100 ${
          active
            ? "bg-brand-tint text-brand"
            : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
        }`}
      >
        <span
          className={`mt-[1px] w-4 shrink-0 font-mono text-[11.5px] ${
            active ? "font-semibold opacity-80" : "opacity-60"
          }`}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`flex items-center gap-1.5 text-[13px] ${active ? "font-semibold" : ""}`}>
            <span className="min-w-0 flex-1 truncate">{topic.title || "Untitled lesson"}</span>
            {flagged ? (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-warn"
                title={topic.updated}
                aria-label={topic.updated}
              />
            ) : null}
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span className="truncate text-[10.5px] text-ink-soft">
              {topic.kind} · {topic.minutes} min
            </span>
            <span className="flex shrink-0 items-center gap-[3px]" aria-hidden>
              {SECTION_ORDER.map((type) => (
                <span
                  key={type}
                  className={`h-[5px] w-[5px] rounded-full ${
                    present.has(type) ? "bg-brand-fill/70" : "bg-line-strong"
                  }`}
                />
              ))}
            </span>
            <span className="shrink-0 text-[10.5px] text-ink-soft">
              {sectionCount === 0 ? "empty" : sectionCount}
            </span>
          </span>
        </span>
      </button>

      <button
        type="button"
        aria-label="Lesson actions"
        onClick={() => setMenuOpen((v) => !v)}
        className={`absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-md text-ink-soft transition-colors hover:bg-surface hover:text-ink ${
          menuOpen || active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          <circle cx="7" cy="3" r="1.3" />
          <circle cx="7" cy="7" r="1.3" />
          <circle cx="7" cy="11" r="1.3" />
        </svg>
      </button>

      {menuOpen ? (
        <div className="absolute right-1.5 top-[34px] z-50 w-[164px] rounded-lg border border-line bg-surface p-1 shadow-[var(--shadow-lg)]">
          <MenuItem
            onClick={() => {
              onDuplicate(topic.slug);
              setMenuOpen(false);
            }}
          >
            <IconGlyph d="M3.5 3.5h5v5h-5z M5.5 1.5h5v5" />
            Duplicate
          </MenuItem>
          <MenuItem
            disabled={isFirst}
            onClick={() => {
              onMove(topic.slug, -1);
              setMenuOpen(false);
            }}
          >
            <IconGlyph d="M6 9.5V2.5M3 5.5L6 2.5l3 3" />
            Move up
          </MenuItem>
          <MenuItem
            disabled={isLast}
            onClick={() => {
              onMove(topic.slug, 1);
              setMenuOpen(false);
            }}
          >
            <IconGlyph d="M6 2.5v7M3 6.5l3 3 3-3" />
            Move down
          </MenuItem>
          <div className="my-1 border-t border-line-soft" />
          <MenuItem
            danger
            onClick={() => {
              onDelete(topic.slug);
              setMenuOpen(false);
            }}
          >
            <IconGlyph d="M2.5 3.5h7M5 3.5V2.5h2v1M4 3.5l.4 6h3.2l.4-6" />
            Delete lesson
          </MenuItem>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-[6px] text-left text-[12.5px] font-medium transition-colors disabled:opacity-30 ${
        danger
          ? "text-status-error-ink hover:bg-status-error-soft"
          : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function IconGlyph({ d }: { d: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
