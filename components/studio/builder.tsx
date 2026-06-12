"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "@/components/drawer";
import type { ApiResponse } from "@/types/api";
import {
  TOPIC_FAMILIES,
  emptyTopic,
  type CourseDraft,
  type TopicDraft,
} from "@/types/studio";
import {
  TEMPLATES,
  clearSection,
  type SectionType,
} from "@/components/studio/builder-blocks";
import { BuilderForm } from "@/components/studio/builder-form";
import { BuilderOutline } from "@/components/studio/builder-outline";
import { BuilderPreview } from "@/components/studio/builder-preview";
import { formatRelative } from "@/components/courses/course-presentation";

/* Course Studio builder (design handoff v3) — full-screen three-pane editor:
   lesson outline → plain-English form → live learner preview. The sidebar
   hides while this screen is open (AppShell handles that). Saves are
   debounced 2s after the last keystroke. */

const drawerInputClass =
  "w-full rounded-[9px] border border-line bg-surface px-3 py-[9px] text-[13.5px] text-ink outline-none transition-colors focus:border-brand-fill focus:ring-[3px] focus:ring-brand-fill/10";

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

function uniqueSlug(draft: CourseDraft, base: string): string {
  const taken = new Set(flatTopics(draft).map((t) => t.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
}

export function Builder({ initialDraft }: { initialDraft: CourseDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(initialDraft.updatedAt);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialDraft.modules[0]?.topics[0]?.slug ?? null,
  );
  const [collapsed, setCollapsed] = useState(false);
  const [added, setAdded] = useState<Record<string, SectionType[]>>({});
  const [autoFocusType, setAutoFocusType] = useState<SectionType | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [preview, setPreview] = useState<{ slug: string; html: string } | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  /* Race-safe saves: only clear `dirty` if nothing changed while the PUT
     was in flight. */
  const draftRef = useRef(draft);
  draftRef.current = draft;

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

  function mutate(fn: (next: CourseDraft) => void) {
    const next = structuredClone(draftRef.current);
    fn(next);
    setDraft(next);
    setDirty(true);
  }

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
        if (!t.whatChanged) t.whatChanged = { pill: "Law changed", meta: "", heading: "", body: "" };
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
        if (!t.whatChanged) t.whatChanged = { pill: "Law changed", meta: "", heading: "", body: "" };
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
  function changeSlug(value: string) {
    if (!selectedSlug) return;
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const old = selectedSlug;
    if (cleaned === old) return;
    if (flatTopics(draftRef.current).some((t) => t.slug === cleaned && t.slug !== old)) return;
    mutateTopic(old, (t) => void (t.slug = cleaned));
    setAdded((prev) => {
      const { [old]: sections, ...rest } = prev;
      return sections ? { ...rest, [cleaned]: sections } : rest;
    });
    setSelectedSlug(cleaned);
  }

  function renameModule(moduleId: string, title: string) {
    mutate((next) => {
      const mod = next.modules.find((m) => m.id === moduleId);
      if (mod) mod.title = title;
    });
  }

  function moveLesson(delta: number) {
    if (!selectedSlug) return;
    mutate((next) => {
      const found = locate(next, selectedSlug);
      if (!found) return;
      const target = found.index + delta;
      if (target < 0 || target >= found.mod.topics.length) return;
      const [topic] = found.mod.topics.splice(found.index, 1);
      found.mod.topics.splice(target, 0, topic);
    });
  }

  function removeLesson() {
    if (!selectedSlug) return;
    const current = draftRef.current;
    if (flatTopics(current).length <= 1) return;
    const flat = flatTopics(current);
    const flatIndex = flat.findIndex((t) => t.slug === selectedSlug);
    const fallback = flat[flatIndex + 1] ?? flat[flatIndex - 1];
    mutate((next) => {
      for (const mod of next.modules) {
        mod.topics = mod.topics.filter((t) => t.slug !== selectedSlug);
      }
      /* drop modules emptied by the removal */
      next.modules = next.modules.filter((m) => m.topics.length > 0);
    });
    setSelectedSlug(fallback?.slug ?? null);
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
      const response = await fetch(
        `/api/studio/drafts/${draft.id}/preview/?slug=${selectedSlug}`,
        { cache: "no-store" },
      );
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

  const saveStatus = saving
    ? "saving…"
    : dirty
      ? "unsaved changes"
      : savedAt
        ? `saved ${formatRelative(savedAt)}`
        : "";

  return (
    <div className="fade-up flex h-full flex-1 flex-col overflow-hidden">
      {/* ── top bar ── */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-line bg-surface px-5 py-[9px]">
        <Link
          href="/course-studio/"
          className="flex items-center gap-[5px] rounded-md px-2 py-[5px] text-[12.5px] text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M8 2L4 6l4 4" />
          </svg>
          All courses
        </Link>
        <span className="h-[22px] w-px shrink-0 bg-line" aria-hidden />
        <input
          value={draft.courseTitle}
          onChange={(e) => mutate((n) => void (n.courseTitle = e.target.value))}
          aria-label="Course title"
          className="min-w-0 max-w-[320px] flex-shrink rounded-[5px] border-none bg-transparent px-[5px] py-0.5 text-sm font-bold tracking-[-0.01em] text-ink outline-none focus:bg-surface-sunken"
          style={{ width: `${Math.max(draft.courseTitle.length, 12)}ch` }}
        />
        <span className="whitespace-nowrap font-mono text-xs text-ink-soft">{saveStatus}</span>
        {error ? (
          <span className="truncate text-xs font-semibold text-status-error-ink">{error}</span>
        ) : null}

        <div className="ml-auto flex items-center gap-[7px]">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="flex items-center gap-[5px] rounded-[7px] border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Course details
          </button>
          <button
            type="button"
            onClick={() => void showServerPreview()}
            disabled={previewBusy || !topic}
            className="flex items-center gap-[5px] rounded-[7px] border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-50"
          >
            {previewBusy ? "Building…" : "Preview"}
          </button>
          <span
            className={`rounded-full px-[9px] py-[3px] text-[11px] font-bold ${
              dirty
                ? "bg-status-warn-soft text-status-warn"
                : "bg-status-ok-soft text-status-ok-ink"
            }`}
          >
            {dirty ? "● Unsaved" : "Saved"}
          </span>
          <button
            type="button"
            onClick={() => void exportZip()}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-[7px] border-none bg-brand-fill px-4 py-[7px] text-[13px] font-bold text-white transition-opacity hover:opacity-[0.88] disabled:opacity-50"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M6 8V2M3 5l3-3 3 3M2 10h8" />
            </svg>
            {exporting ? "Exporting…" : "Export package"}
          </button>
        </div>
      </div>

      {/* ── three panes ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <BuilderOutline
          modules={draft.modules}
          selectedSlug={selectedSlug}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          onSelect={selectLesson}
          onRenameModule={renameModule}
          onAddLesson={addLesson}
          onAddModule={addModule}
        />
        {topic ? (
          <BuilderForm
            key={`${found!.mod.id}:${found!.index}`}
            topic={topic}
            added={added[topic.slug] ?? []}
            autoFocusType={autoFocusType}
            canRemoveLesson={flat.length > 1}
            canMoveUp={(found?.index ?? 0) > 0}
            canMoveDown={found ? found.index < found.mod.topics.length - 1 : false}
            onTopicChange={(fn) => mutateTopic(topic.slug, fn)}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onApplyTemplate={applyTemplate}
            onMoveLesson={moveLesson}
            onRemoveLesson={removeLesson}
            onSlugChange={changeSlug}
          />
        ) : (
          <div className="grid flex-1 place-items-center bg-paper text-sm text-ink-muted">
            Add a lesson to get started.
          </div>
        )}
        {topic ? (
          <BuilderPreview
            draft={draft}
            topic={topic}
            added={added[topic.slug] ?? []}
            lessonIndex={Math.max(flatIndex, 0)}
            lessonTotal={flat.length}
          />
        ) : null}
      </div>

      {/* ── course details drawer ── */}
      <Drawer open={detailsOpen} title="Course details" onClose={() => setDetailsOpen(false)}>
        <div className="space-y-4">
          <DrawerField label="Course id" hint="Unique — namespaces learner progress. Lowercase + hyphens.">
            <input
              className={drawerInputClass}
              value={draft.courseId}
              onChange={(e) =>
                mutate(
                  (n) =>
                    void (n.courseId = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")),
                )
              }
            />
          </DrawerField>
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
              rows={2}
              className={`${drawerInputClass} resize-y leading-relaxed`}
              value={draft.courseBlurb}
              onChange={(e) => mutate((n) => void (n.courseBlurb = e.target.value))}
            />
          </DrawerField>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Topic family" hint="Sets the accent colour.">
              <select
                className={drawerInputClass}
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
            </DrawerField>
            <DrawerField label="Chrome" hint="bar = top bar · rail = sidebar.">
              <select
                className={drawerInputClass}
                value={draft.chromeMode}
                onChange={(e) =>
                  mutate((n) => void (n.chromeMode = e.target.value as CourseDraft["chromeMode"]))
                }
              >
                <option value="bar">bar</option>
                <option value="rail">rail</option>
              </select>
            </DrawerField>
          </div>
          <DrawerField label="Home link URL" hint="Where the wrapper's home button points.">
            <input
              className={drawerInputClass}
              value={draft.homeLinkUrl}
              onChange={(e) => mutate((n) => void (n.homeLinkUrl = e.target.value))}
            />
          </DrawerField>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setDetailsOpen(false);
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
              Content preview with real course styles. The chrome bar, progress, and prev/next
              come alive in the exported package.
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
      <span className="mb-1 block text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-soft">
        {label}
      </span>
      {hint ? <span className="mb-1 block text-[11px] text-ink-soft">{hint}</span> : null}
      {children}
    </label>
  );
}
