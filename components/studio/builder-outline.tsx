"use client";

import type { ModuleDraft } from "@/types/studio";

/* Pane 1 — lesson outline. 258px, collapses to a 44px number rail. */

export function BuilderOutline({
  modules,
  selectedSlug,
  collapsed,
  onToggleCollapsed,
  onSelect,
  onRenameModule,
  onAddLesson,
  onAddModule,
}: {
  modules: ModuleDraft[];
  selectedSlug: string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (slug: string) => void;
  onRenameModule: (moduleId: string, title: string) => void;
  onAddLesson: (moduleId: string) => void;
  onAddModule: () => void;
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
            {mod.topics.map((topic, index) => {
              const active = topic.slug === selectedSlug;
              const flagged = topic.updated !== "";
              return (
                <button
                  key={topic.slug}
                  type="button"
                  onClick={() => onSelect(topic.slug)}
                  title={topic.title || topic.slug}
                  className={`flex items-center text-left transition-colors duration-100 ${
                    collapsed
                      ? "h-[30px] w-[30px] justify-center rounded-md"
                      : "w-full gap-2 rounded-[7px] py-[7px] pl-3 pr-2 text-[13px]"
                  } ${
                    active
                      ? "bg-brand-tint font-semibold text-brand"
                      : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                  }`}
                >
                  <span
                    className={`shrink-0 font-mono ${
                      collapsed
                        ? "text-xs font-bold"
                        : `w-4 text-[11.5px] ${active ? "opacity-80" : "opacity-60"}`
                    }`}
                  >
                    {index + 1}
                  </span>
                  {!collapsed ? (
                    <>
                      <span className="min-w-0 flex-1 truncate">{topic.title || "Untitled lesson"}</span>
                      {flagged ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-warn"
                          title={topic.updated}
                          aria-label={topic.updated}
                        />
                      ) : null}
                    </>
                  ) : null}
                </button>
              );
            })}
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
