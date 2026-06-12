"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TOPIC_KINDS, UPDATED_FLAGS, type TopicDraft } from "@/types/studio";
import {
  BLOCKS,
  TEMPLATES,
  activeSections,
  type SectionType,
} from "@/components/studio/builder-blocks";

/* Pane 2 — the lesson form. Core fields on top, then the section system:
   template quick-start chips, section blocks, and the block picker. */

const inputClass =
  "w-full rounded-[9px] border border-line bg-surface px-3 py-[9px] text-[13.5px] text-ink outline-none transition-colors focus:border-brand-fill focus:ring-[3px] focus:ring-brand-fill/10";
const labelClass =
  "mb-1 block text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-soft";
const hintClass = "mb-[5px] text-[11.5px] text-ink-soft";
const blockTextareaClass =
  "w-full resize-y border-none bg-transparent text-[13.5px] leading-[1.65] text-ink outline-none placeholder:text-ink-soft";

export function BuilderForm({
  topic,
  added,
  autoFocusType,
  canRemoveLesson,
  canMoveUp,
  canMoveDown,
  onTopicChange,
  onAddSection,
  onRemoveSection,
  onApplyTemplate,
  onMoveLesson,
  onRemoveLesson,
  onSlugChange,
}: {
  topic: TopicDraft;
  added: SectionType[];
  autoFocusType: SectionType | null;
  canRemoveLesson: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
  onAddSection: (type: SectionType) => void;
  onRemoveSection: (type: SectionType) => void;
  onApplyTemplate: (name: keyof typeof TEMPLATES) => void;
  onMoveLesson: (delta: number) => void;
  onRemoveLesson: () => void;
  onSlugChange: (slug: string) => void;
}) {
  const sections = activeSections(topic, added);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Design: selecting a lesson scrolls the form back to the top. The form
     remounts per lesson (keyed by module+index in the builder), so on-mount
     is exactly "on lesson switch". */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto bg-paper">
      <div className="max-w-[560px] px-9 pb-[60px] pt-7">
        <div className="mb-5">
          <label className={labelClass} htmlFor="f-title">
            Lesson title
          </label>
          <input
            id="f-title"
            className={inputClass}
            value={topic.title}
            onChange={(e) => onTopicChange((t) => void (t.title = e.target.value))}
          />
        </div>

        <div className="mb-5">
          <label className={labelClass} htmlFor="f-summary">
            One-line summary
          </label>
          <p className={hintClass}>Shown in the course outline.</p>
          <input
            id="f-summary"
            className={inputClass}
            value={topic.description}
            onChange={(e) => onTopicChange((t) => void (t.description = e.target.value))}
          />
        </div>

        <div className="mb-5 flex gap-2.5">
          <div className="flex-[1.2]">
            <label className={labelClass} htmlFor="f-type">
              Type
            </label>
            <select
              id="f-type"
              className={inputClass}
              value={topic.kind}
              onChange={(e) =>
                onTopicChange((t) => void (t.kind = e.target.value as TopicDraft["kind"]))
              }
            >
              {TOPIC_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-[0.6]">
            <label className={labelClass} htmlFor="f-minutes">
              Minutes
            </label>
            <input
              id="f-minutes"
              type="number"
              min={1}
              max={60}
              className={inputClass}
              value={topic.minutes}
              onChange={(e) =>
                onTopicChange((t) => void (t.minutes = Number(e.target.value) || 1))
              }
            />
          </div>
          <div className="flex-[1.2]">
            <label className={labelClass} htmlFor="f-flag">
              Flag
            </label>
            <select
              id="f-flag"
              className={inputClass}
              value={topic.updated}
              onChange={(e) => onTopicChange((t) => void (t.updated = e.target.value))}
            >
              {UPDATED_FLAGS.map((flag) => (
                <option key={flag} value={flag}>
                  {flag || "None"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className={labelClass} htmlFor="f-hook">
            The Hook
          </label>
          <p className={hintClass}>One bold line under the title. **bold** and _italic_ work.</p>
          <textarea
            id="f-hook"
            rows={2}
            className={`${inputClass} resize-y leading-relaxed`}
            value={topic.standfirst}
            onChange={(e) => onTopicChange((t) => void (t.standfirst = e.target.value))}
          />
        </div>

        <hr className="mb-5 mt-1.5 border-0 border-t border-line" />

        <div className="mb-4 flex flex-wrap items-center gap-[7px]">
          <span className="mr-0.5 whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-soft">
            Start from
          </span>
          {(Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onApplyTemplate(name)}
              className="rounded-full border border-line bg-surface px-[11px] py-1 text-xs font-semibold text-ink-muted transition-colors hover:border-brand-fill hover:bg-brand-tint hover:text-brand"
            >
              {TEMPLATES[name].label}
            </button>
          ))}
        </div>

        {sections.length === 0 ? (
          <div className="mb-2.5 rounded-[10px] border-[1.5px] border-dashed border-line px-4 py-5 text-center text-[13px] leading-relaxed text-ink-soft">
            <strong className="block text-[13px] font-bold text-ink-muted">No sections yet</strong>
            Pick a template above or add sections one by one below.
          </div>
        ) : (
          sections.map((type, index) => (
            <SectionBlock
              key={type}
              type={type}
              index={index}
              topic={topic}
              autoFocus={type === autoFocusType}
              onTopicChange={onTopicChange}
              onRemove={() => onRemoveSection(type)}
            />
          ))
        )}

        <AddSectionPicker active={sections} onAdd={onAddSection} />

        <div className="mt-8 flex items-center gap-2 border-t border-line-soft pt-4">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-soft">
            This lesson
          </span>
          <button
            type="button"
            onClick={() => onMoveLesson(-1)}
            disabled={!canMoveUp}
            className="btn-secondary !px-2.5 !py-1 !text-xs disabled:opacity-30"
          >
            ↑ Move up
          </button>
          <button
            type="button"
            onClick={() => onMoveLesson(1)}
            disabled={!canMoveDown}
            className="btn-secondary !px-2.5 !py-1 !text-xs disabled:opacity-30"
          >
            ↓ Move down
          </button>
          <button
            type="button"
            onClick={onRemoveLesson}
            disabled={!canRemoveLesson}
            className="ml-auto rounded-md px-2.5 py-1 text-xs font-semibold text-status-error-ink transition-colors hover:bg-status-error-soft disabled:opacity-30"
          >
            Remove lesson
          </button>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-[11px] text-ink-soft">Filename:</span>
          <input
            value={topic.slug}
            onChange={(e) => onSlugChange(e.target.value)}
            aria-label="Lesson slug (filename)"
            className="w-44 rounded-md border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink-muted outline-none focus:border-brand-fill"
          />
          <span className="font-mono text-[11px] text-ink-soft">.html</span>
        </div>
      </div>
    </div>
  );
}

/* ── Section blocks ─────────────────────────────────────────────────────── */

function SectionBlock({
  type,
  index,
  topic,
  autoFocus,
  onTopicChange,
  onRemove,
}: {
  type: SectionType;
  index: number;
  topic: TopicDraft;
  autoFocus: boolean;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
  onRemove: () => void;
}) {
  const block = BLOCKS[type];
  const accent =
    block.accent === "warn"
      ? {
          card: "border-status-warn-soft bg-status-warn-soft",
          header: "border-b-status-warn/15",
          num: "border-status-warn/30 bg-status-warn-soft text-status-warn",
          name: "text-status-warn",
        }
      : block.accent === "info"
        ? {
            card: "border-brand-fill/20 bg-brand-tint",
            header: "border-b-brand-fill/10",
            num: "border-brand-fill/30 bg-brand-tint text-brand",
            name: "text-brand",
          }
        : {
            card: "border-line bg-surface",
            header: "border-b-line-soft",
            num: "border-line bg-surface-sunken text-ink-muted",
            name: "text-ink",
          };

  return (
    <div className={`mb-3.5 overflow-hidden rounded-xl border ${accent.card}`}>
      <div className={`flex items-center gap-[11px] border-b px-4 py-3 ${accent.header}`}>
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11.5px] font-bold ${accent.num}`}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[13px] font-bold ${accent.name}`}>{block.name}</span>
          <span className="block text-[11.5px] text-ink-soft">{block.hint}</span>
        </span>
        <button
          type="button"
          onClick={onRemove}
          title="Remove section"
          className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[5px] text-ink-soft transition-colors hover:bg-status-error-soft hover:text-status-error"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>
      <div className="px-4 py-3">
        <SectionBody type={type} topic={topic} autoFocus={autoFocus} onTopicChange={onTopicChange} />
      </div>
    </div>
  );
}

function SectionBody({
  type,
  topic,
  autoFocus,
  onTopicChange,
}: {
  type: SectionType;
  topic: TopicDraft;
  autoFocus: boolean;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
}) {
  switch (type) {
    case "scene":
      return (
        <textarea
          rows={5}
          autoFocus={autoFocus}
          className={blockTextareaClass}
          placeholder="Describe the client situation and their problem…"
          value={topic.scenario}
          onChange={(e) => onTopicChange((t) => void (t.scenario = e.target.value))}
        />
      );

    case "rule":
      return (
        <>
          <textarea
            rows={4}
            autoFocus={autoFocus}
            className={blockTextareaClass}
            placeholder="The law, stated plainly…"
            value={topic.rule}
            onChange={(e) => onTopicChange((t) => void (t.rule = e.target.value))}
          />
          <RuleBox topic={topic} onTopicChange={onTopicChange} />
        </>
      );

    case "changed": {
      const changed = topic.whatChanged;
      if (!changed) return null;
      return (
        <div className="space-y-2.5">
          <SmallField label="Heading">
            <input
              autoFocus={autoFocus}
              className={inputClass}
              placeholder="What changed, in one line…"
              value={changed.heading}
              onChange={(e) => onTopicChange((t) => void (t.whatChanged!.heading = e.target.value))}
            />
          </SmallField>
          <SmallField label="Body">
            <textarea
              rows={3}
              className={`${inputClass} resize-y leading-relaxed`}
              placeholder="Describe what changed and when…"
              value={changed.body}
              onChange={(e) => onTopicChange((t) => void (t.whatChanged!.body = e.target.value))}
            />
          </SmallField>
          <div className="flex gap-2.5">
            <SmallField label="Pill" hint='e.g. "Law changed · 3 days ago"'>
              <input
                className={inputClass}
                value={changed.pill}
                onChange={(e) => onTopicChange((t) => void (t.whatChanged!.pill = e.target.value))}
              />
            </SmallField>
            <SmallField label="Citation" hint='e.g. "Ch. 167 · effective immediately"'>
              <input
                className={inputClass}
                value={changed.meta}
                onChange={(e) => onTopicChange((t) => void (t.whatChanged!.meta = e.target.value))}
              />
            </SmallField>
          </div>
        </div>
      );
    }

    case "media":
      return <MediaList topic={topic} onTopicChange={onTopicChange} />;

    case "tryit":
      return (
        <div className="space-y-3">
          <textarea
            rows={2}
            autoFocus={autoFocus}
            className={blockTextareaClass}
            placeholder="Your question here…"
            value={topic.tryIt.question}
            onChange={(e) => onTopicChange((t) => void (t.tryIt.question = e.target.value))}
          />
          <div className="space-y-2">
            {topic.tryIt.options.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${topic.slug}`}
                  checked={option.correct}
                  onChange={() =>
                    onTopicChange((t) => t.tryIt.options.forEach((o, j) => (o.correct = j === i)))
                  }
                  className="accent-[var(--status-ok)]"
                  aria-label={`Mark option ${i + 1} correct`}
                />
                <input
                  className={inputClass}
                  placeholder={`Option ${i + 1}`}
                  value={option.text}
                  onChange={(e) =>
                    onTopicChange((t) => void (t.tryIt.options[i].text = e.target.value))
                  }
                />
                <button
                  type="button"
                  onClick={() => onTopicChange((t) => void t.tryIt.options.splice(i, 1))}
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
              onClick={() =>
                onTopicChange((t) => void t.tryIt.options.push({ text: "", correct: false }))
              }
              disabled={topic.tryIt.options.length >= 6}
              className="btn-secondary !px-2.5 !py-1 !text-xs"
            >
              + Add option
            </button>
          </div>
          <SmallField label="Answer explanation" hint="Shown after the learner chooses.">
            <textarea
              rows={2}
              className={`${inputClass} resize-y leading-relaxed`}
              value={topic.tryIt.answer}
              onChange={(e) => onTopicChange((t) => void (t.tryIt.answer = e.target.value))}
            />
          </SmallField>
        </div>
      );

    case "remember":
      return (
        <textarea
          rows={3}
          autoFocus={autoFocus}
          className={blockTextareaClass}
          placeholder={"The single most important thing to remember…\nOne per line."}
          value={topic.remember.join("\n")}
          onChange={(e) => onTopicChange((t) => void (t.remember = e.target.value.split("\n")))}
        />
      );
  }
}

function SmallField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1 block text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-soft">
        {label}
      </span>
      {hint ? <span className="mb-1 block text-[11px] text-ink-soft">{hint}</span> : null}
      {children}
    </label>
  );
}

/* Optional numbered call-out box under "State the rule" — progressive
   disclosure: hidden behind a link until used. */
function RuleBox({
  topic,
  onTopicChange,
}: {
  topic: TopicDraft;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
}) {
  const inUse = topic.ruleBoxLabel.trim() !== "" || topic.ruleBoxItems.some((i) => i.trim());
  const [open, setOpen] = useState(inUse);

  if (!open && !inUse) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-semibold text-brand hover:underline"
      >
        + Add numbered call-out box
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2.5 border-t border-line-soft pt-3">
      <SmallField label="Call-out box label" hint="Optional callout under the rule.">
        <input
          className={inputClass}
          placeholder='e.g. "The notice must state"'
          value={topic.ruleBoxLabel}
          onChange={(e) => onTopicChange((t) => void (t.ruleBoxLabel = e.target.value))}
        />
      </SmallField>
      <SmallField label="Items" hint="One numbered item per line.">
        <textarea
          rows={3}
          className={`${inputClass} resize-y leading-relaxed`}
          value={topic.ruleBoxItems.join("\n")}
          onChange={(e) => onTopicChange((t) => void (t.ruleBoxItems = e.target.value.split("\n")))}
        />
      </SmallField>
    </div>
  );
}

function MediaList({
  topic,
  onTopicChange,
}: {
  topic: TopicDraft;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11.5px] text-ink-soft">
        Name the image file and where it goes — the export adds an{" "}
        <code className="font-mono text-[11px]">images/README.txt</code> listing what to drop in
        before uploading to Brightspace.
      </p>
      {(topic.media ?? []).map((media, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_auto_auto]">
          <input
            className={inputClass}
            placeholder="filename.png"
            value={media.filename}
            onChange={(e) => onTopicChange((t) => void (t.media[i].filename = e.target.value))}
          />
          <input
            className={inputClass}
            placeholder="Alt text (what the image shows)"
            value={media.alt}
            onChange={(e) => onTopicChange((t) => void (t.media[i].alt = e.target.value))}
          />
          <select
            className={inputClass}
            value={media.placement}
            onChange={(e) =>
              onTopicChange(
                (t) => void (t.media[i].placement = e.target.value as "scenario" | "rule"),
              )
            }
            aria-label="Placement"
          >
            <option value="scenario">after Scene</option>
            <option value="rule">after Rule</option>
          </select>
          <button
            type="button"
            onClick={() => onTopicChange((t) => void t.media.splice(i, 1))}
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
          onTopicChange((t) => {
            if (!t.media) t.media = [];
            t.media.push({ filename: "", alt: "", caption: "", placement: "scenario" });
          })
        }
        className="btn-secondary !px-2.5 !py-1 !text-xs"
      >
        + Add image placeholder
      </button>
    </div>
  );
}

/* Dashed "+ Add section" button with the 2-column block picker popover. */
function AddSectionPicker({
  active,
  onAdd,
}: {
  active: SectionType[];
  onAdd: (type: SectionType) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const iconTint: Record<SectionType, string> = {
    scene: "bg-brand-tint",
    rule: "bg-[#efeafd]",
    changed: "bg-status-warn-soft",
    tryit: "bg-status-ok-soft",
    remember: "bg-brand-tint",
    media: "bg-status-neutral-soft",
  };

  return (
    <div ref={wrapRef} className="relative mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2 rounded-[10px] border-[1.5px] border-dashed px-3.5 py-[11px] text-[13px] font-medium transition-colors ${
          open
            ? "border-brand-fill bg-brand-tint text-brand"
            : "border-line-strong text-ink-soft hover:border-brand-fill hover:bg-brand-tint hover:text-brand"
        }`}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6.5 1v11M1 6.5h11" />
        </svg>
        Add section
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 grid grid-cols-2 gap-[3px] rounded-xl border border-line bg-surface p-2 shadow-[var(--shadow-lg)]">
          {(Object.keys(BLOCKS) as SectionType[]).map((type) => {
            const taken = active.includes(type);
            return (
              <button
                key={type}
                type="button"
                disabled={taken}
                onClick={() => {
                  onAdd(type);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-[9px] rounded-lg px-[11px] py-[9px] text-left transition-colors hover:bg-surface-sunken disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-[7px] text-sm ${iconTint[type]}`}
                  aria-hidden
                >
                  {BLOCKS[type].emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight text-ink">
                    {BLOCKS[type].name}
                  </span>
                  <span className="block truncate text-[11px] text-ink-soft">
                    {taken ? "Already in this lesson" : BLOCKS[type].hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
