"use client";

import { useEffect, useRef, useState } from "react";
import type { ModuleDraft, TopicDraft } from "@/types/studio";
import { SECTION_ORDER, sectionsWithContent } from "@/components/studio/builder-blocks";

/* Left rail (cool direction) — 280px, --surface. Accent mono eyebrow "Your
   course"; per module a mono-uppercase title and lesson rows (number chip,
   title, mono meta, build-out dots). The active row sits on --accent-tint.
   Footer: a dashed "New part of the course" button and an auto-save line with
   a green haloed dot. The per-row ⋯ menu (move / duplicate / delete) and the
   per-module "Add lesson" affordance are kept from the prior outline. */

export function BuilderRail({
  modules,
  selectedSlug,
  saving,
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
  saving: boolean;
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
    <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-line bg-surface">
      <div className="flex items-center justify-between px-[18px] pb-2 pt-[18px]">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-accent">
          Your course
        </span>
        <span className="font-mono text-[10.5px] text-ink-soft">
          {modules.length} part{modules.length === 1 ? "" : "s"} · {total} lesson
          {total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3.5 pt-1.5">
        {modules.map((mod) => (
          <div key={mod.id} className="mb-2.5">
            <input
              value={mod.title}
              onChange={(e) => onRenameModule(mod.id, e.target.value)}
              aria-label="Part title"
              className="w-full border-none bg-transparent px-2 pb-1.5 pt-[9px] font-mono text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-soft outline-none focus:text-ink-muted"
            />
            {mod.topics.map((topic, index) => (
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
            ))}
            <button
              type="button"
              onClick={() => onAddLesson(mod.id)}
              className="mt-0.5 flex w-full items-center gap-1.5 rounded-lg px-3 py-[7px] text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink-muted"
            >
              <PlusGlyph /> Add lesson
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddModule}
          className="mt-1 flex w-full items-center justify-center gap-[7px] rounded-[10px] border border-dashed border-line-strong px-3 py-[11px] text-[12.5px] font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          <PlusGlyph /> New part of the course
        </button>
      </div>

      <div className="flex items-center gap-[9px] border-t border-line px-[18px] py-[13px] font-mono text-[10.5px] text-ink-soft">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            saving ? "bg-status-warn shadow-[0_0_0_3px_var(--amber-tint)]" : "bg-ok shadow-[0_0_0_3px_var(--ok-glow)]"
          }`}
          aria-hidden
        />
        {saving ? "Saving…" : "Saved automatically"}
      </div>
    </aside>
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

  const present = new Set(sectionsWithContent(topic));

  return (
    <div ref={wrapRef} className="group relative">
      <button
        type="button"
        onClick={() => onSelect(topic.slug)}
        title={topic.title || topic.slug}
        className={`mb-0.5 flex w-full items-start gap-[11px] rounded-[10px] py-[9px] pl-2.5 pr-8 text-left transition-colors ${
          active ? "bg-[var(--accent-tint)]" : "hover:bg-surface-sunken"
        }`}
      >
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-[7px] font-mono text-[11px] font-semibold ${
            active ? "bg-accent text-white" : "bg-surface-sunken text-ink-soft"
          }`}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-[13.5px] ${
              active ? "font-bold text-ink" : "font-semibold text-ink-muted"
            }`}
          >
            {topic.title || "Untitled lesson"}
          </span>
          <span className="mt-1 flex items-center gap-[7px]">
            <span className="font-mono text-[10px] text-ink-soft">
              {topic.kind} · {topic.minutes} min
            </span>
            <span className="flex shrink-0 gap-[3px]" aria-hidden>
              {SECTION_ORDER.map((type) => (
                <span
                  key={type}
                  className={`h-[5px] w-[5px] rounded-full ${
                    present.has(type) ? "bg-accent" : "bg-line-strong"
                  }`}
                />
              ))}
            </span>
          </span>
        </span>
      </button>

      <button
        type="button"
        aria-label="Lesson actions"
        onClick={() => setMenuOpen((v) => !v)}
        className={`absolute right-1.5 top-[9px] grid h-6 w-6 place-items-center rounded-md text-ink-soft transition-colors hover:bg-surface hover:text-ink ${
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
        <div className="absolute right-1.5 top-[36px] z-50 w-[164px] rounded-lg border border-line bg-surface p-1 shadow-[var(--shadow-lg)]">
          <MenuItem
            onClick={() => {
              onDuplicate(topic.slug);
              setMenuOpen(false);
            }}
          >
            <Glyph d="M3.5 3.5h5v5h-5z M5.5 1.5h5v5" /> Duplicate
          </MenuItem>
          <MenuItem
            disabled={isFirst}
            onClick={() => {
              onMove(topic.slug, -1);
              setMenuOpen(false);
            }}
          >
            <Glyph d="M6 9.5V2.5M3 5.5L6 2.5l3 3" /> Move up
          </MenuItem>
          <MenuItem
            disabled={isLast}
            onClick={() => {
              onMove(topic.slug, 1);
              setMenuOpen(false);
            }}
          >
            <Glyph d="M6 2.5v7M3 6.5l3 3 3-3" /> Move down
          </MenuItem>
          <div className="my-1 border-t border-line-soft" />
          <MenuItem
            danger
            onClick={() => {
              onDelete(topic.slug);
              setMenuOpen(false);
            }}
          >
            <Glyph d="M2.5 3.5h7M5 3.5V2.5h2v1M4 3.5l.4 6h3.2l.4-6" /> Delete lesson
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

function Glyph({ d }: { d: string }) {
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

function PlusGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M6 2v8M2 6h8" />
    </svg>
  );
}
