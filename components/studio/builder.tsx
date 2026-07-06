"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "@/components/drawer";
import type { ApiResponse } from "@/types/api";
import { TOPIC_FAMILIES, emptyTopic, type CourseDraft, type TopicDraft } from "@/types/studio";
import {
  TEMPLATES,
  clearSection,
  familyAccentStyle,
  familyColor,
  sectionsWithContent,
  type SectionType,
} from "@/components/studio/builder-blocks";
import { BuilderCanvas } from "@/components/studio/builder-canvas";
import { BuilderRail } from "@/components/studio/builder-rail";
import { PublishSettingsSection } from "@/components/studio/publish-settings";
import { isDeployReady } from "@/lib/studio/deploy";
import { slugify } from "@/lib/studio/slug";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatRelative } from "@/components/courses/course-presentation";
import { IconScales } from "@/components/icons";
import { useTheme } from "@/components/theme-provider";

/* Course Studio builder (design handoff v3) — full-screen three-pane editor:
   lesson outline → plain-English form → live learner preview. The sidebar
   hides while this screen is open (AppShell handles that). Saves are
   debounced 2s after the last keystroke. */

/* Course Details fields — cool spec: 44px, radius 10, --bg fill, accent focus
   ring. Textareas drop the fixed height and add vertical padding instead. */
const drawerInputClass =
  "h-11 w-full rounded-[10px] border border-line bg-paper px-[13px] text-[13.5px] text-ink outline-none transition-colors focus:border-accent focus:ring-[3px] focus:ring-[var(--accent-tint)]";
const drawerAreaClass =
  "w-full rounded-[10px] border border-line bg-paper px-[13px] py-[11px] text-[13.5px] leading-relaxed text-ink outline-none transition-colors focus:border-accent focus:ring-[3px] focus:ring-[var(--accent-tint)]";

function locate(draft: CourseDraft, slug: string | null) {
  if (!slug) return null;
  for (const mod of draft.modules) {
    const index = mod.topics.findIndex((t) => t.slug === slug);
    if (index >= 0) return { mod, index };
  }
  return null;
}

function flatTopics(draft: CourseDraft): TopicDraft[] {
  return draft.modules.flatMap((m) => m.topics);
}

function uniqueSlug(draft: CourseDraft, base: string, ignore?: string): string {
  const taken = new Set(flatTopics(draft).map((t) => t.slug));
  if (ignore) taken.delete(ignore);
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
}

/* True when the slug is the title's slugified form, allowing the -2/-3
   suffix uniqueSlug may have appended. */
function slugMatchesTitle(slug: string, title: string): boolean {
  const base = slugify(title);
  return (
    slug === base || new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+$`).test(slug)
  );
}

/* Placeholder names a fresh lesson starts with — never treated as
   hand-edited, so the first real title takes over the filename. */
function isPlaceholderSlug(slug: string): boolean {
  return /^topic-\d+(-\d+)?$/.test(slug) || /^new-lesson(-\d+)?$/.test(slug);
}

export function Builder({
  initialDraft,
  openDetailsInitially = false,
}: {
  initialDraft: CourseDraft;
  openDetailsInitially?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(initialDraft.updatedAt);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialDraft.modules[0]?.topics[0]?.slug ?? null,
  );
  const [added, setAdded] = useState<Record<string, SectionType[]>>({});
  const [autoFocusType, setAutoFocusType] = useState<SectionType | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(openDetailsInitially);
  const [pendingDelete, setPendingDelete] = useState<{
    slug: string;
    title: string;
    sections: number;
  } | null>(null);
  const [preview, setPreview] = useState<{ slug: string; html: string } | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  function closeDetails() {
    setDetailsOpen(false);
    if (openDetailsInitially) {
      router.replace(`/course-studio/${draft.id}/`, { scroll: false });
    }
  }

  /* Race-safe saves: only clear `dirty` if nothing changed while the PUT
     was in flight. */
  const draftRef = useRef(draft);
  draftRef.current = draft;

  /* Lessons whose filename was hand-edited keep it; all others auto-follow
     the title. Seeded once so slugs in existing drafts that already diverged
     from their titles are never renamed behind the author's back. */
  const manualSlugs = useRef<Set<string>>(
    new Set(
      initialDraft.modules
        .flatMap((m) => m.topics)
        .filter((t) => !slugMatchesTitle(t.slug, t.title) && !isPlaceholderSlug(t.slug))
        .map((t) => t.slug),
    ),
  );

  async function save(): Promise<boolean> {
    const snapshot = draftRef.current;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/studio/drafts/${snapshot.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      const body = (await response.json()) as ApiResponse<CourseDraft>;
      if (body.ok) {
        setSavedAt(body.data.updatedAt);
        if (draftRef.current === snapshot) setDirty(false);
        return true;
      }
      setError(body.error.message);
      return false;
    } catch {
      setError("Save failed.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  /* Auto-save: 2s after the last change (design handoff behavior). */
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      void save();
    }, 2000);
    return () => clearTimeout(timer);
  }, [draft, dirty]);

  /* Close the overflow menu on any outside click. */
  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  /* ── undo/redo ──
     Snapshot history around mutate(). Since mutate always works on a fresh
     structuredClone, the previous draft object is immutable — pushing the
     reference is a safe snapshot. Typing bursts coalesce into one entry. */
  const HISTORY_LIMIT = 100;
  const COALESCE_MS = 800;
  const historyRef = useRef<{ past: CourseDraft[]; future: CourseDraft[]; lastPushAt: number }>({
    past: [],
    future: [],
    lastPushAt: 0,
  });
  /* bumped whenever the stacks change, so the toolbar buttons re-render */
  const [, setHistoryVersion] = useState(0);

  function mutate(fn: (next: CourseDraft) => void) {
    const prev = draftRef.current;
    const history = historyRef.current;
    const now = Date.now();
    if (now - history.lastPushAt > COALESCE_MS) {
      history.past.push(prev);
      if (history.past.length > HISTORY_LIMIT) history.past.shift();
    }
    history.lastPushAt = now;
    history.future = [];
    setHistoryVersion((v) => v + 1);

    const next = structuredClone(prev);
    fn(next);
    setDraft(next);
    setDirty(true);
  }

  /* After a restore the selected lesson may no longer exist. */
  function restoreDraft(restored: CourseDraft) {
    setDraft(restored);
    setDirty(true);
    if (!locate(restored, selectedSlug)) {
      setSelectedSlug(restored.modules[0]?.topics[0]?.slug ?? null);
    }
  }

  function undo() {
    const history = historyRef.current;
    const previous = history.past.pop();
    if (!previous) return;
    history.future.push(draftRef.current);
    history.lastPushAt = 0;
    setHistoryVersion((v) => v + 1);
    restoreDraft(previous);
  }

  function redo() {
    const history = historyRef.current;
    const next = history.future.pop();
    if (!next) return;
    history.past.push(draftRef.current);
    history.lastPushAt = 0;
    setHistoryVersion((v) => v + 1);
    restoreDraft(next);
  }

  /* Ctrl/Cmd+Z everywhere in the builder. Every field is a controlled input
     driven by draft state, so app-level undo is the only coherent model —
     native per-field undo would desync from the draft. */
  const undoRef = useRef({ undo, redo });
  undoRef.current = { undo, redo };
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) undoRef.current.redo();
        else undoRef.current.undo();
      } else if (key === "y") {
        event.preventDefault();
        undoRef.current.redo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function mutateTopic(slug: string, fn: (topic: TopicDraft) => void) {
    mutate((next) => {
      for (const mod of next.modules) {
        const topic = mod.topics.find((t) => t.slug === slug);
        if (topic) fn(topic);
      }
    });
  }

  /* ── sections ── */

  function addSection(type: SectionType) {
    if (!selectedSlug) return;
    if (type === "changed") {
      mutateTopic(selectedSlug, (t) => {
        if (!t.whatChanged)
          t.whatChanged = { pill: "Law changed", meta: "", heading: "", body: "" };
      });
    }
    setAdded((prev) => ({
      ...prev,
      [selectedSlug]: [...(prev[selectedSlug] ?? []), type],
    }));
    setAutoFocusType(type);
  }

  function removeSection(type: SectionType) {
    if (!selectedSlug) return;
    mutateTopic(selectedSlug, (t) => clearSection(t, type));
    setAdded((prev) => ({
      ...prev,
      [selectedSlug]: (prev[selectedSlug] ?? []).filter((s) => s !== type),
    }));
    if (autoFocusType === type) setAutoFocusType(null);
  }

  function applyTemplate(name: keyof typeof TEMPLATES) {
    if (!selectedSlug) return;
    const sections = TEMPLATES[name].sections;
    if (sections.includes("changed")) {
      mutateTopic(selectedSlug, (t) => {
        if (!t.whatChanged)
          t.whatChanged = { pill: "Law changed", meta: "", heading: "", body: "" };
      });
    }
    setAdded((prev) => ({ ...prev, [selectedSlug]: [...sections] }));
    setAutoFocusType(null);
  }

  /* ── outline ── */

  function selectLesson(slug: string) {
    setSelectedSlug(slug);
    setAutoFocusType(null);
  }

  function addLesson(moduleId: string) {
    const n = flatTopics(draftRef.current).length + 1;
    const slug = uniqueSlug(draftRef.current, `topic-${n}`);
    mutate((next) => {
      const mod = next.modules.find((m) => m.id === moduleId);
      if (!mod) return;
      mod.topics.push(emptyTopic(slug, `New lesson`));
    });
    setSelectedSlug(slug);
    setAutoFocusType(null);
  }

  function addModule() {
    const current = draftRef.current;
    let modId = `module-${current.modules.length + 1}`;
    for (let n = current.modules.length + 1; current.modules.some((m) => m.id === modId); n++) {
      modId = `module-${n + 1}`;
    }
    const slug = uniqueSlug(current, `topic-${flatTopics(current).length + 1}`);
    mutate((next) => {
      next.modules.push({
        id: modId,
        title: `Module ${next.modules.length + 1}`,
        description: "",
        topics: [emptyTopic(slug, "New lesson")],
      });
    });
    setSelectedSlug(slug);
  }

  /* Slug doubles as the lesson's identity (selection key, section-state
     key, export filename) — renaming it has to rename all three. */
  function renameSlug(old: string, next: string) {
    mutate((draft) => {
      for (const mod of draft.modules) {
        const t = mod.topics.find((topic) => topic.slug === old);
        if (t) t.slug = next;
      }
    });
    setAdded((prev) => {
      const { [old]: sections, ...rest } = prev;
      return sections ? { ...rest, [next]: sections } : rest;
    });
    setSelectedSlug(next);
  }

  /* Hand-editing the filename pins it — the title stops driving it. */
  function changeSlug(value: string) {
    if (!selectedSlug) return;
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const old = selectedSlug;
    if (cleaned === old) return;
    if (flatTopics(draftRef.current).some((t) => t.slug === cleaned && t.slug !== old)) return;
    manualSlugs.current.delete(old);
    manualSlugs.current.add(cleaned);
    renameSlug(old, cleaned);
  }

  /* Title edits rename the file automatically unless it was hand-edited.
     Title + slug move in one mutate so undo treats them as a single step. */
  function changeTitle(slug: string, title: string) {
    if (manualSlugs.current.has(slug)) {
      mutateTopic(slug, (t) => void (t.title = title));
      return;
    }
    const base = slugify(title);
    const next = slugMatchesTitle(slug, title) ? slug : uniqueSlug(draftRef.current, base, slug);
    mutate((draft) => {
      for (const mod of draft.modules) {
        const t = mod.topics.find((topic) => topic.slug === slug);
        if (t) {
          t.title = title;
          t.slug = next;
        }
      }
    });
    if (next !== slug) {
      setAdded((prev) => {
        const { [slug]: sections, ...rest } = prev;
        return sections ? { ...rest, [next]: sections } : rest;
      });
      if (selectedSlug === slug) setSelectedSlug(next);
    }
  }

  function renameModule(moduleId: string, title: string) {
    mutate((next) => {
      const mod = next.modules.find((m) => m.id === moduleId);
      if (mod) mod.title = title;
    });
  }

  function moveLesson(slug: string, delta: number) {
    mutate((next) => {
      const found = locate(next, slug);
      if (!found) return;
      const target = found.index + delta;
      if (target < 0 || target >= found.mod.topics.length) return;
      const [topic] = found.mod.topics.splice(found.index, 1);
      found.mod.topics.splice(target, 0, topic);
    });
  }

  function duplicateLesson(slug: string) {
    const current = draftRef.current;
    const found = locate(current, slug);
    if (!found) return;
    const source = found.mod.topics[found.index];
    const newSlug = uniqueSlug(current, `${slug}-copy`);
    const clone = structuredClone(source);
    clone.slug = newSlug;
    clone.title = source.title ? `${source.title} (copy)` : "New lesson";
    mutate((next) => {
      const target = locate(next, slug);
      if (!target) return;
      target.mod.topics.splice(target.index + 1, 0, clone);
    });
    /* carry over the explicitly-added section state so the copy opens identical */
    setAdded((prev) => (prev[slug] ? { ...prev, [newSlug]: [...prev[slug]] } : prev));
    setSelectedSlug(newSlug);
    setAutoFocusType(null);
  }

  /* Delete is gated by ConfirmDialog only when the lesson holds content;
     an empty lesson deletes instantly. */
  function requestDeleteLesson(slug: string) {
    const found = locate(draftRef.current, slug);
    if (!found) return;
    const topic = found.mod.topics[found.index];
    const sections = sectionsWithContent(topic).length;
    const hasContent =
      sections > 0 || topic.description.trim() !== "" || topic.standfirst.trim() !== "";
    if (hasContent) {
      setPendingDelete({ slug, title: topic.title || "Untitled lesson", sections });
    } else {
      removeLesson(slug);
    }
  }

  function removeLesson(slug: string) {
    const flat = flatTopics(draftRef.current);
    const flatIndex = flat.findIndex((t) => t.slug === slug);
    const fallback = flat[flatIndex + 1] ?? flat[flatIndex - 1];
    mutate((next) => {
      for (const mod of next.modules) {
        mod.topics = mod.topics.filter((t) => t.slug !== slug);
      }
      /* drop modules emptied by the removal */
      next.modules = next.modules.filter((m) => m.topics.length > 0);
    });
    setAdded((prev) => {
      if (!prev[slug]) return prev;
      const rest = { ...prev };
      delete rest[slug];
      return rest;
    });
    if (selectedSlug === slug) setSelectedSlug(fallback?.slug ?? null);
  }

  /* ── top bar actions ── */

  async function exportZip() {
    if (dirty && !(await save())) return;
    setExporting(true);
    setError(null);
    try {
      const response = await fetch(`/api/studio/drafts/${draft.id}/export/`);
      if (!response.ok) {
        const body = (await response.json()) as ApiResponse<never>;
        setError(body.ok === false ? body.error.message : "Export failed.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${draft.courseId}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function showServerPreview() {
    if (!selectedSlug) return;
    if (dirty && !(await save())) return;
    setPreviewBusy(true);
    try {
      const response = await fetch(`/api/studio/drafts/${draft.id}/preview/?slug=${selectedSlug}`, {
        cache: "no-store",
      });
      const body = (await response.json()) as ApiResponse<{ html: string }>;
      if (body.ok) setPreview({ slug: selectedSlug, html: body.data.html });
      else setError(body.error.message);
    } catch {
      setError("Preview failed.");
    } finally {
      setPreviewBusy(false);
    }
  }

  const found = locate(draft, selectedSlug);
  const topic = found ? found.mod.topics[found.index] : null;
  const flat = flatTopics(draft);
  const flatIndex = topic ? flat.findIndex((t) => t.slug === topic.slug) : 0;

  /* One save indicator instead of two: the pill carries label, tone, and the
     relative save time (was a separate redundant text element). */
  const savePill = saving
    ? { label: "Saving…", tone: "bg-status-warn-soft text-status-warn" }
    : dirty
      ? { label: "● Unsaved", tone: "bg-status-warn-soft text-status-warn" }
      : {
          label: savedAt ? `Saved · ${formatRelative(savedAt)}` : "Saved",
          tone: "bg-status-ok-soft text-status-ok-ink",
        };

  const deployReady = isDeployReady(draft);

  return (
    <div
      className="fade-up flex h-full flex-1 flex-col overflow-hidden"
      style={familyAccentStyle(draft.topic)}
    >
      {/* ── top bar ── */}
      <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line bg-surface px-[22px]">
        <Link
          href="/course-studio/"
          title="All courses"
          aria-label="All courses"
          className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-ink text-surface transition-transform hover:-translate-x-0.5"
        >
          <IconScales size={16} />
        </Link>
        <div className="flex min-w-0 items-center gap-2.5">
          <input
            value={draft.courseTitle}
            onChange={(e) => mutate((n) => void (n.courseTitle = e.target.value))}
            aria-label="Course title"
            className="min-w-0 max-w-[360px] flex-shrink rounded-lg border-none bg-transparent px-2 py-[5px] font-display text-[17px] font-semibold tracking-[-0.02em] text-ink outline-none focus:bg-surface-sunken"
            style={{ width: `${Math.max(draft.courseTitle.length, 10)}ch` }}
          />
          <span className="rounded-[5px] bg-[var(--accent-tint)] px-2 py-[3px] font-mono text-[9.5px] font-semibold tracking-[0.06em] text-accent">
            DRAFT
          </span>
        </div>
        {error ? (
          <span className="truncate text-xs font-semibold text-status-error-ink">{error}</span>
        ) : null}

        <div className="ml-auto flex items-center gap-2.5">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              onClick={undo}
              disabled={historyRef.current.past.length === 0}
              className="grid h-8 w-8 place-items-center rounded-[8px] text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              onClick={redo}
              disabled={historyRef.current.future.length === 0}
              className="grid h-8 w-8 place-items-center rounded-[8px] text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m15 14 5-5-5-5" />
                <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            title={
              deployReady
                ? "Exports are pre-wired for Brightspace. Click to review."
                : "Exports work on your computer only. Click to pick a Brightspace course."
            }
            onClick={() => setDetailsOpen(true)}
            className={`whitespace-nowrap rounded-[6px] px-[9px] py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] transition-colors ${
              deployReady
                ? "bg-status-ok-soft text-status-ok-ink"
                : "bg-surface-sunken text-ink-soft hover:text-ink"
            }`}
          >
            {deployReady ? "Deploy-ready" : "Local preview"}
          </button>
          <span
            className={`whitespace-nowrap rounded-[6px] px-[9px] py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] transition-colors ${savePill.tone}`}
          >
            {savePill.label}
          </span>
          <button
            type="button"
            onClick={() => void showServerPreview()}
            disabled={previewBusy || !topic}
            className="flex h-9 items-center gap-[7px] rounded-[9px] border border-line bg-surface px-[13px] text-[12.5px] font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path d="M1 8s2.7-4.5 7-4.5S15 8 15 8s-2.7 4.5-7 4.5S1 8 1 8z" />
              <circle cx="8" cy="8" r="2" />
            </svg>
            {previewBusy ? "Building…" : "Preview as learner"}
          </button>
          <button
            type="button"
            onClick={() => void exportZip()}
            disabled={exporting}
            className="btn-primary disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M8 11V2.5M5 5L8 2l3 3" />
              <path d="M2.5 9.5V13h11V9.5" />
            </svg>
            {exporting ? "Exporting…" : "Share with learners"}
          </button>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className={`grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-surface text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink ${
                menuOpen ? "bg-surface-sunken text-ink" : ""
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <circle cx="3" cy="7" r="1.3" />
                <circle cx="7" cy="7" r="1.3" />
                <circle cx="11" cy="7" r="1.3" />
              </svg>
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[42px] z-50 w-[188px] rounded-lg border border-line bg-surface p-1 shadow-[var(--shadow-lg)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDetailsOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 13a1.6 1.6 0 00.3 1.8 2 2 0 11-2.8 2.8 1.6 1.6 0 00-2.7 1.1 2 2 0 11-4 0 1.6 1.6 0 00-2.7-1.1 2 2 0 11-2.8-2.8A1.6 1.6 0 003 13a2 2 0 110-4 1.6 1.6 0 001.5-2.6 2 2 0 112.8-2.8A1.6 1.6 0 0010 4a2 2 0 114 0 1.6 1.6 0 002.7 1.1 2 2 0 112.8 2.8A1.6 1.6 0 0021 11a2 2 0 110 4 1.6 1.6 0 00-1.6 1z" />
                  </svg>
                  Course details
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    toggleTheme();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                >
                  {theme === "dark" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                      aria-hidden
                    >
                      <path d="M20 14.5A8 8 0 119.5 4 6.5 6.5 0 0020 14.5z" />
                    </svg>
                  )}
                  {theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── rail + canvas ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <BuilderRail
          modules={draft.modules}
          selectedSlug={selectedSlug}
          saving={saving}
          onSelect={selectLesson}
          onRenameModule={renameModule}
          onAddLesson={addLesson}
          onAddModule={addModule}
          onMoveLesson={moveLesson}
          onDuplicateLesson={duplicateLesson}
          onDeleteLesson={requestDeleteLesson}
        />
        {topic ? (
          <BuilderCanvas
            key={`${found!.mod.id}:${found!.index}`}
            draftId={draft.id}
            topic={topic}
            added={added[topic.slug] ?? []}
            autoFocusType={autoFocusType}
            lessonIndex={Math.max(flatIndex, 0)}
            lessonTotal={flat.length}
            onTopicChange={(fn) => mutateTopic(topic.slug, fn)}
            onTitleChange={(title) => changeTitle(topic.slug, title)}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onApplyTemplate={applyTemplate}
            onSlugChange={changeSlug}
          />
        ) : (
          <div className="grid flex-1 place-items-center bg-paper text-sm text-ink-muted">
            Add a lesson to get started.
          </div>
        )}
      </div>

      {/* ── course details drawer ── */}
      <Drawer open={detailsOpen} title="Course details" onClose={closeDetails}>
        <div className="space-y-4">
          <PublishSettingsSection
            publish={draft.publish}
            firstPageFile={flat[0] ? `${flat[0].slug}.html` : null}
            inputClass={drawerInputClass}
            onChange={(next) => mutate((n) => void (n.publish = next))}
          />
          <DrawerField label="Subtitle" hint="One sentence under the title.">
            <input
              className={drawerInputClass}
              value={draft.courseSubtitle}
              onChange={(e) => mutate((n) => void (n.courseSubtitle = e.target.value))}
            />
          </DrawerField>
          <DrawerField label="Practice area" hint='Breadcrumb label, e.g. "Court Skills".'>
            <input
              className={drawerInputClass}
              value={draft.courseArea}
              onChange={(e) => mutate((n) => void (n.courseArea = e.target.value))}
            />
          </DrawerField>
          <DrawerField label="Blurb" hint="Outline-page lead. Supports **bold** and _italic_.">
            <textarea
              rows={3}
              className={`${drawerAreaClass} resize-y`}
              value={draft.courseBlurb}
              onChange={(e) => mutate((n) => void (n.courseBlurb = e.target.value))}
            />
          </DrawerField>
          <DrawerField label="Topic family" hint="Sets the accent colour.">
            <div className="relative">
              <span
                className="pointer-events-none absolute left-[13px] top-1/2 z-10 h-[11px] w-[11px] -translate-y-1/2 rounded-[3px]"
                style={{ background: familyColor(draft.topic) }}
                aria-hidden
              />
              <select
                className={`${drawerInputClass} pl-[34px] capitalize`}
                value={draft.topic}
                onChange={(e) =>
                  mutate((n) => void (n.topic = e.target.value as CourseDraft["topic"]))
                }
              >
                {TOPIC_FAMILIES.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </div>
          </DrawerField>

          <details className="rounded-[10px] border border-line px-4 py-3">
            <summary className="cursor-pointer font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Advanced
            </summary>
            <div className="mt-3 space-y-4">
              <DrawerField
                label="Progress key"
                hint="Identifies this course in learners' saved progress. Don't change it after learners have started the course."
              >
                <input
                  className={`${drawerInputClass} font-mono`}
                  value={draft.courseId}
                  onChange={(e) =>
                    mutate(
                      (n) =>
                        void (n.courseId = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")),
                    )
                  }
                />
              </DrawerField>
              <DrawerField label="Navigation style" hint="How learners move between lessons.">
                <select
                  className={drawerInputClass}
                  value={draft.chromeMode}
                  onChange={(e) =>
                    mutate((n) => void (n.chromeMode = e.target.value as CourseDraft["chromeMode"]))
                  }
                >
                  <option value="bar">Top bar</option>
                  <option value="rail">Side rail</option>
                </select>
              </DrawerField>
              <DrawerField label="Exit button link" hint="Where “Exit to Hub” takes learners.">
                <input
                  className={`${drawerInputClass} font-mono !text-[12.5px]`}
                  value={draft.homeLinkUrl}
                  onChange={(e) => mutate((n) => void (n.homeLinkUrl = e.target.value))}
                />
              </DrawerField>
            </div>
          </details>
          <button
            type="button"
            className="btn-primary self-start"
            onClick={() => {
              closeDetails();
              router.refresh();
            }}
          >
            Done
          </button>
        </div>
      </Drawer>

      {/* ── server-rendered topic preview (real wrapper styles) ── */}
      <Drawer
        open={preview !== null}
        title={`Preview · ${topic?.title ?? preview?.slug ?? ""}`}
        onClose={() => setPreview(null)}
      >
        {preview ? (
          <>
            <p className="mb-3 text-xs text-ink-muted">
              Content preview with real course styles. The chrome bar, progress, and prev/next come
              alive in the exported package.
            </p>
            <iframe
              title="Topic preview"
              sandbox="allow-same-origin"
              srcDoc={preview.html}
              className="h-[70vh] w-full rounded-lg border border-line bg-white"
            />
          </>
        ) : null}
      </Drawer>

      {/* ── delete-lesson confirm (only when the lesson has content) ── */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        message={
          pendingDelete
            ? `This removes ${pendingDelete.sections} section${
                pendingDelete.sections === 1 ? "" : "s"
              }. You can bring it back with Undo (Ctrl+Z).`
            : ""
        }
        confirmLabel="Delete lesson"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeLesson(pendingDelete.slug);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function DrawerField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </span>
      {hint ? (
        <span className="mb-2 block text-[12px] leading-snug text-ink-soft">{hint}</span>
      ) : null}
      {children}
    </label>
  );
}
