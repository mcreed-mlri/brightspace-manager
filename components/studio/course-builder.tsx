"use client";

import { useState } from "react";
import { Drawer } from "@/components/drawer";
import { StatusBadge } from "@/components/status-badge";
import type { ApiResponse } from "@/types/api";
import {
  emptyTopic,
  TOPIC_FAMILIES,
  TOPIC_KINDS,
  UPDATED_FLAGS,
  type CourseDraft,
  type ModuleDraft,
  type TopicDraft,
} from "@/types/studio";
import { formatRelative } from "@/components/courses/course-presentation";

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelClass = "block text-[11px] font-medium uppercase tracking-wider text-ink-soft";

function Field({
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
      <span className={labelClass}>{label}</span>
      {hint ? <span className="block text-[11px] text-ink-soft">{hint}</span> : null}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

export function CourseBuilder({ initialDraft }: { initialDraft: CourseDraft }) {
  const [draft, setDraft] = useState(initialDraft);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openTopic, setOpenTopic] = useState<string | null>(
    initialDraft.modules[0]?.topics[0]?.slug ?? null,
  );
  const [preview, setPreview] = useState<{ slug: string; html: string } | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);

  function mutate(fn: (next: CourseDraft) => void) {
    const next = structuredClone(draft);
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

  async function save(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/studio/drafts/${draft.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = (await response.json()) as ApiResponse<CourseDraft>;
      if (body.ok) {
        setDraft(body.data);
        setDirty(false);
        setSavedAt(body.data.updatedAt);
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

  async function exportZip() {
    if (dirty && !(await save())) return;
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
    }
  }

  async function showPreview(slug: string) {
    if (dirty && !(await save())) return;
    setPreviewBusy(true);
    try {
      const response = await fetch(`/api/studio/drafts/${draft.id}/preview/?slug=${slug}`, {
        cache: "no-store",
      });
      const body = (await response.json()) as ApiResponse<{ html: string }>;
      if (body.ok) setPreview({ slug, html: body.data.html });
      else setError(body.error.message);
    } catch {
      setError("Preview failed.");
    } finally {
      setPreviewBusy(false);
    }
  }

  function addTopic(moduleId: string) {
    mutate((next) => {
      const mod = next.modules.find((m) => m.id === moduleId);
      if (!mod) return;
      const n = next.modules.flatMap((m) => m.topics).length + 1;
      const topic = emptyTopic(`topic-${n}`, `Topic ${n}`);
      mod.topics.push(topic);
      setOpenTopic(topic.slug);
    });
  }

  function removeTopic(moduleId: string, slug: string) {
    mutate((next) => {
      const mod = next.modules.find((m) => m.id === moduleId);
      if (mod) mod.topics = mod.topics.filter((t) => t.slug !== slug);
    });
  }

  function moveTopic(moduleId: string, index: number, delta: number) {
    mutate((next) => {
      const mod = next.modules.find((m) => m.id === moduleId);
      if (!mod) return;
      const target = index + delta;
      if (target < 0 || target >= mod.topics.length) return;
      const [topic] = mod.topics.splice(index, 1);
      mod.topics.splice(target, 0, topic);
    });
  }

  const flatCount = draft.modules.flatMap((m) => m.topics).length;

  return (
    <>
      {/* ── action bar ── */}
      <div className="sticky top-0 z-30 -mx-1 mb-6 flex flex-wrap items-center gap-2.5 border-b border-line bg-paper/95 px-1 py-3 backdrop-blur">
        <button type="button" onClick={() => void save()} disabled={saving || !dirty} className="btn-primary">
          {saving ? "Saving…" : dirty ? "Save draft" : "Saved"}
        </button>
        <button type="button" onClick={() => void exportZip()} disabled={saving} className="btn-blue">
          Export course package (.zip)
        </button>
        {savedAt && !dirty ? (
          <span className="font-mono text-xs text-ink-soft">saved {formatRelative(savedAt)}</span>
        ) : null}
        {dirty ? <StatusBadge tone="warn">unsaved changes</StatusBadge> : null}
        {error ? <StatusBadge tone="error">{error}</StatusBadge> : null}
      </div>

      {/* ── course identity ── */}
      <section className="editorial-card mb-6 px-5 py-4">
        <h2 className="section-title mb-4 text-ink">Course</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Course title">
            <input
              className={inputClass}
              value={draft.courseTitle}
              onChange={(e) => mutate((n) => void (n.courseTitle = e.target.value))}
            />
          </Field>
          <Field label="Course id" hint="Unique — namespaces learner progress. Lowercase + hyphens.">
            <input
              className={inputClass}
              value={draft.courseId}
              onChange={(e) =>
                mutate((n) => void (n.courseId = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")))
              }
            />
          </Field>
          <Field label="Subtitle" hint="One sentence under the title.">
            <input
              className={inputClass}
              value={draft.courseSubtitle}
              onChange={(e) => mutate((n) => void (n.courseSubtitle = e.target.value))}
            />
          </Field>
          <Field label="Practice area" hint='Breadcrumb label, e.g. "Court Skills".'>
            <input
              className={inputClass}
              value={draft.courseArea}
              onChange={(e) => mutate((n) => void (n.courseArea = e.target.value))}
            />
          </Field>
          <Field label="Blurb" hint="Outline-page lead. Supports **bold** and _italic_.">
            <input
              className={inputClass}
              value={draft.courseBlurb}
              onChange={(e) => mutate((n) => void (n.courseBlurb = e.target.value))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Topic family" hint="Sets the accent colour.">
              <select
                className={inputClass}
                value={draft.topic}
                onChange={(e) => mutate((n) => void (n.topic = e.target.value as CourseDraft["topic"]))}
              >
                {TOPIC_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Chrome" hint="bar = top bar · rail = sidebar.">
              <select
                className={inputClass}
                value={draft.chromeMode}
                onChange={(e) =>
                  mutate((n) => void (n.chromeMode = e.target.value as CourseDraft["chromeMode"]))
                }
              >
                <option value="bar">bar</option>
                <option value="rail">rail</option>
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* ── modules & topics ── */}
      {draft.modules.map((mod) => (
        <ModuleEditor
          key={mod.id}
          module={mod}
          flatCount={flatCount}
          openTopic={openTopic}
          previewBusy={previewBusy}
          onToggleTopic={(slug) => setOpenTopic(openTopic === slug ? null : slug)}
          onModuleChange={(fn) =>
            mutate((next) => {
              const m = next.modules.find((x) => x.id === mod.id);
              if (m) fn(m);
            })
          }
          onTopicChange={mutateTopic}
          onAddTopic={() => addTopic(mod.id)}
          onRemoveTopic={(slug) => removeTopic(mod.id, slug)}
          onMoveTopic={(index, delta) => moveTopic(mod.id, index, delta)}
          onPreview={(slug) => void showPreview(slug)}
        />
      ))}

      <Drawer
        open={preview !== null}
        title={`Preview · ${preview?.slug ?? ""}`}
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
    </>
  );
}

/* ── module + topic editors ─────────────────────────────────────────────── */

function ModuleEditor({
  module: mod,
  flatCount,
  openTopic,
  previewBusy,
  onToggleTopic,
  onModuleChange,
  onTopicChange,
  onAddTopic,
  onRemoveTopic,
  onMoveTopic,
  onPreview,
}: {
  module: ModuleDraft;
  flatCount: number;
  openTopic: string | null;
  previewBusy: boolean;
  onToggleTopic: (slug: string) => void;
  onModuleChange: (fn: (mod: ModuleDraft) => void) => void;
  onTopicChange: (slug: string, fn: (topic: TopicDraft) => void) => void;
  onAddTopic: () => void;
  onRemoveTopic: (slug: string) => void;
  onMoveTopic: (index: number, delta: number) => void;
  onPreview: (slug: string) => void;
}) {
  return (
    <section className="editorial-card mb-6 px-5 py-4">
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field label="Module title">
          <input
            className={inputClass}
            value={mod.title}
            onChange={(e) => onModuleChange((m) => void (m.title = e.target.value))}
          />
        </Field>
        <Field label="Module description">
          <input
            className={inputClass}
            value={mod.description}
            onChange={(e) => onModuleChange((m) => void (m.description = e.target.value))}
          />
        </Field>
      </div>

      <div className="space-y-2">
        {mod.topics.map((topic, index) => (
          <div key={topic.slug} className="rounded-lg border border-line">
            <div className="flex items-center gap-2 px-3.5 py-2.5">
              <button
                type="button"
                onClick={() => onToggleTopic(topic.slug)}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <span className="font-mono text-xs text-ink-soft">{index + 1}</span>
                <span className="truncate text-sm font-medium text-ink">
                  {topic.title || topic.slug}
                </span>
                <span className="font-mono text-[11px] text-ink-soft">
                  {topic.kind} · {topic.minutes} min
                </span>
                <span className="ml-auto font-mono text-xs text-ink-soft">
                  {openTopic === topic.slug ? "−" : "+"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onMoveTopic(index, -1)}
                disabled={index === 0}
                className="rounded p-1 text-ink-soft hover:bg-surface-sunken hover:text-ink disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMoveTopic(index, 1)}
                disabled={index === mod.topics.length - 1}
                className="rounded p-1 text-ink-soft hover:bg-surface-sunken hover:text-ink disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
            {openTopic === topic.slug ? (
              <TopicEditor
                topic={topic}
                flatCount={flatCount}
                previewBusy={previewBusy}
                onChange={(fn) => onTopicChange(topic.slug, fn)}
                onRemove={() => onRemoveTopic(topic.slug)}
                onPreview={() => onPreview(topic.slug)}
              />
            ) : null}
          </div>
        ))}
      </div>

      <button type="button" onClick={onAddTopic} className="btn-secondary mt-3">
        + Add topic
      </button>
    </section>
  );
}

function TopicEditor({
  topic,
  flatCount,
  previewBusy,
  onChange,
  onRemove,
  onPreview,
}: {
  topic: TopicDraft;
  flatCount: number;
  previewBusy: boolean;
  onChange: (fn: (topic: TopicDraft) => void) => void;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const hasChanged = topic.whatChanged !== null;

  return (
    <div className="space-y-4 border-t border-line-soft px-3.5 py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Field label="Slug" hint="Filename: slug.html">
          <input
            className={inputClass}
            value={topic.slug}
            onChange={(e) =>
              onChange((t) => void (t.slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")))
            }
          />
        </Field>
        <Field label="Title">
          <input
            className={inputClass}
            value={topic.title}
            onChange={(e) => onChange((t) => void (t.title = e.target.value))}
          />
        </Field>
        <Field label="Kind">
          <select
            className={inputClass}
            value={topic.kind}
            onChange={(e) => onChange((t) => void (t.kind = e.target.value as TopicDraft["kind"]))}
          >
            {TOPIC_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Minutes">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={topic.minutes}
              onChange={(e) => onChange((t) => void (t.minutes = Number(e.target.value) || 1))}
            />
          </Field>
          <Field label="Flag">
            <select
              className={inputClass}
              value={topic.updated}
              onChange={(e) => onChange((t) => void (t.updated = e.target.value))}
            >
              {UPDATED_FLAGS.map((f) => (
                <option key={f} value={f}>
                  {f || "(none)"}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Outline description" hint="One line shown in the course outline.">
        <input
          className={inputClass}
          value={topic.description}
          onChange={(e) => onChange((t) => void (t.description = e.target.value))}
        />
      </Field>

      <Field label="Standfirst" hint="The hook under the title. Supports **bold** and _italic_.">
        <textarea
          rows={2}
          className={inputClass}
          value={topic.standfirst}
          onChange={(e) => onChange((t) => void (t.standfirst = e.target.value))}
        />
      </Field>

      <Field label="§ 1 · The scenario" hint="A real client, a real moment. Blank line = new paragraph.">
        <textarea
          rows={4}
          className={inputClass}
          value={topic.scenario}
          onChange={(e) => onChange((t) => void (t.scenario = e.target.value))}
        />
      </Field>

      <Field label="§ 2 · The rule" hint="The law, stated plainly.">
        <textarea
          rows={4}
          className={inputClass}
          value={topic.rule}
          onChange={(e) => onChange((t) => void (t.rule = e.target.value))}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field label="Rule box label" hint="Optional callout box under §2. Leave empty to skip.">
          <input
            className={inputClass}
            value={topic.ruleBoxLabel}
            onChange={(e) => onChange((t) => void (t.ruleBoxLabel = e.target.value))}
          />
        </Field>
        <Field label="Rule box items" hint="One numbered item per line.">
          <textarea
            rows={3}
            className={inputClass}
            value={topic.ruleBoxItems.join("\n")}
            onChange={(e) => onChange((t) => void (t.ruleBoxItems = e.target.value.split("\n")))}
          />
        </Field>
      </div>

      <div className="rounded-lg border border-line-soft bg-paper px-3.5 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={hasChanged}
            onChange={(e) =>
              onChange(
                (t) =>
                  void (t.whatChanged = e.target.checked
                    ? { pill: "Law changed", meta: "", heading: "", body: "" }
                    : null),
              )
            }
            className="accent-[var(--brand-fill)]"
          />
          § 3 · What changed — include only when the law moved
        </label>
        {hasChanged && topic.whatChanged ? (
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label="Pill" hint='e.g. "Law changed · 3 days ago"'>
              <input
                className={inputClass}
                value={topic.whatChanged.pill}
                onChange={(e) => onChange((t) => void (t.whatChanged!.pill = e.target.value))}
              />
            </Field>
            <Field label="Citation" hint='e.g. "Ch. 167 · effective immediately"'>
              <input
                className={inputClass}
                value={topic.whatChanged.meta}
                onChange={(e) => onChange((t) => void (t.whatChanged!.meta = e.target.value))}
              />
            </Field>
            <Field label="Heading">
              <input
                className={inputClass}
                value={topic.whatChanged.heading}
                onChange={(e) => onChange((t) => void (t.whatChanged!.heading = e.target.value))}
              />
            </Field>
            <Field label="Body">
              <textarea
                rows={3}
                className={inputClass}
                value={topic.whatChanged.body}
                onChange={(e) => onChange((t) => void (t.whatChanged!.body = e.target.value))}
              />
            </Field>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-line-soft bg-paper px-3.5 py-3">
        <p className="mb-1 text-sm font-medium text-ink">Media placeholders</p>
        <p className="mb-3 text-xs text-ink-muted">
          Name the image file and where it goes — the export adds an{" "}
          <code className="font-mono text-[11px]">images/README.txt</code> listing what to drop in
          before uploading to Brightspace.
        </p>
        <div className="space-y-2">
          {(topic.media ?? []).map((media, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <input
                className={inputClass}
                placeholder="filename.png"
                value={media.filename}
                onChange={(e) => onChange((t) => void (t.media[i].filename = e.target.value))}
              />
              <input
                className={inputClass}
                placeholder="Alt text (what the image shows)"
                value={media.alt}
                onChange={(e) => onChange((t) => void (t.media[i].alt = e.target.value))}
              />
              <input
                className={inputClass}
                placeholder="Caption (optional)"
                value={media.caption}
                onChange={(e) => onChange((t) => void (t.media[i].caption = e.target.value))}
              />
              <select
                className={inputClass}
                value={media.placement}
                onChange={(e) =>
                  onChange(
                    (t) => void (t.media[i].placement = e.target.value as "scenario" | "rule"),
                  )
                }
                aria-label="Placement"
              >
                <option value="scenario">after §1 Scenario</option>
                <option value="rule">after §2 Rule</option>
              </select>
              <button
                type="button"
                onClick={() => onChange((t) => void t.media.splice(i, 1))}
                className="rounded p-1 text-ink-soft hover:bg-surface-sunken hover:text-status-error"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange((t) => {
                if (!t.media) t.media = [];
                t.media.push({ filename: "", alt: "", caption: "", placement: "scenario" });
              })
            }
            className="btn-secondary"
          >
            + Add image placeholder
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-line-soft bg-paper px-3.5 py-3">
        <p className="mb-3 text-sm font-medium text-ink">§ Try it — one question, the climax</p>
        <Field label="Question">
          <textarea
            rows={2}
            className={inputClass}
            value={topic.tryIt.question}
            onChange={(e) => onChange((t) => void (t.tryIt.question = e.target.value))}
          />
        </Field>
        <div className="mt-3 space-y-2">
          {topic.tryIt.options.map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${topic.slug}`}
                checked={option.correct}
                onChange={() =>
                  onChange((t) => t.tryIt.options.forEach((o, j) => (o.correct = j === i)))
                }
                className="accent-[var(--status-ok)]"
                aria-label={`Mark option ${i + 1} correct`}
              />
              <input
                className={inputClass}
                placeholder={`Option ${i + 1}`}
                value={option.text}
                onChange={(e) => onChange((t) => void (t.tryIt.options[i].text = e.target.value))}
              />
              <button
                type="button"
                onClick={() => onChange((t) => void t.tryIt.options.splice(i, 1))}
                disabled={topic.tryIt.options.length <= 2}
                className="rounded p-1 text-ink-soft hover:bg-surface-sunken hover:text-status-error disabled:opacity-30"
                aria-label="Remove option"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange((t) => void t.tryIt.options.push({ text: "", correct: false }))}
            disabled={topic.tryIt.options.length >= 6}
            className="btn-secondary"
          >
            + Add option
          </button>
        </div>
        <div className="mt-3">
          <Field label="Answer explanation" hint="Shown after the learner chooses.">
            <textarea
              rows={2}
              className={inputClass}
              value={topic.tryIt.answer}
              onChange={(e) => onChange((t) => void (t.tryIt.answer = e.target.value))}
            />
          </Field>
        </div>
      </div>

      <Field label="§ Remember" hint="The 2–3 things that must stick. One per line.">
        <textarea
          rows={3}
          className={inputClass}
          value={topic.remember.join("\n")}
          onChange={(e) => onChange((t) => void (t.remember = e.target.value.split("\n")))}
        />
      </Field>

      <div className="flex items-center gap-2 border-t border-line-soft pt-3">
        <button type="button" onClick={onPreview} disabled={previewBusy} className="btn-secondary">
          {previewBusy ? "Building preview…" : "Preview topic"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={flatCount <= 1}
          className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-status-error-ink transition-colors hover:bg-status-error-soft disabled:opacity-30"
        >
          Remove topic
        </button>
      </div>
    </div>
  );
}
