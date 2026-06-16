"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  TOPIC_KINDS,
  UPDATED_FLAGS,
  emptyBlock,
  type ContentBlock,
  type ContentBlockType,
  type TopicDraft,
} from "@/types/studio";
import {
  BLOCKS,
  BLOCK_TYPES,
  TEMPLATES,
  activeSections,
  type SectionType,
} from "@/components/studio/builder-blocks";

/* Narrow a ContentBlock to a specific variant by its `type` tag. */
type BlockOf<K extends ContentBlockType> = Extract<ContentBlock, { type: K }>;

/* Canvas (cool direction) — the lesson IS the editor. Accent eyebrow, a 38px
   Space Grotesk title, the hook line, a bordered controls strip (Type pills +
   Length stepper + Flag), then the content blocks. Each block is introduced by
   an S-marker row — [accent mono "S1"] · hairline · [ink-soft UPPERCASE label]
   — the same marker the learner-facing reader uses, tying authoring to output.
   Every section maps 1:1 onto the existing TopicDraft fields, so the export
   pipeline is untouched. */

const SECTION_LABEL: Record<SectionType, string> = {
  scene: "The scenario",
  rule: "The rule",
  changed: "What changed",
  media: "Media",
  interactive: "Interactive",
  tryit: "Try it",
  remember: "Remember",
};

const blockTextareaClass =
  "w-full resize-y border-none bg-transparent text-[15px] leading-[1.65] text-ink outline-none placeholder:text-ink-soft";
const fieldClass =
  "w-full rounded-[9px] border border-line bg-paper px-3 py-[9px] text-[13.5px] text-ink outline-none transition-colors focus:border-accent focus:ring-[3px] focus:ring-[var(--accent-tint)]";
const monoLabelClass =
  "mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft";

export function BuilderCanvas({
  topic,
  added,
  autoFocusType,
  lessonIndex,
  lessonTotal,
  onTopicChange,
  onAddSection,
  onRemoveSection,
  onApplyTemplate,
  onSlugChange,
}: {
  topic: TopicDraft;
  added: SectionType[];
  autoFocusType: SectionType | null;
  lessonIndex: number;
  lessonTotal: number;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
  onAddSection: (type: SectionType) => void;
  onRemoveSection: (type: SectionType) => void;
  onApplyTemplate: (name: keyof typeof TEMPLATES) => void;
  onSlugChange: (slug: string) => void;
}) {
  const sections = activeSections(topic, added);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Selecting a lesson scrolls the canvas back to the top. The canvas remounts
     per lesson (keyed in the builder), so on-mount == on lesson switch. */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  function setMinutes(delta: number) {
    onTopicChange((t) => void (t.minutes = Math.min(60, Math.max(1, t.minutes + delta))));
  }

  return (
    <main ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto bg-paper">
      <div className="mx-auto max-w-[680px] px-11 pb-[100px] pt-9">
        <div className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-accent">
          {topic.kind} · Topic {lessonIndex + 1} of {lessonTotal}
        </div>

        <input
          value={topic.title}
          onChange={(e) => onTopicChange((t) => void (t.title = e.target.value))}
          aria-label="Lesson title"
          placeholder="Untitled lesson"
          className="w-full border-none bg-transparent p-0 font-display text-[38px] font-bold leading-[1.08] tracking-[-0.03em] text-ink outline-none placeholder:text-ink-soft"
        />
        <input
          value={topic.standfirst}
          onChange={(e) => onTopicChange((t) => void (t.standfirst = e.target.value))}
          aria-label="Hook"
          placeholder="One bold line under the title…"
          className="mt-2.5 w-full border-none bg-transparent p-0 text-[16.5px] leading-[1.5] text-ink-muted outline-none placeholder:text-ink-soft"
        />

        {/* controls strip */}
        <div className="my-6 flex flex-wrap items-center gap-x-[18px] gap-y-3 border-y border-line py-[15px]">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-soft">Type</span>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_KINDS.map((kind) => {
                const active = topic.kind === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => onTopicChange((t) => void (t.kind = kind))}
                    className={`inline-flex items-center rounded-lg border px-3 py-[5px] text-[12px] font-semibold transition-colors ${
                      active
                        ? "border-accent bg-[var(--accent-tint)] text-accent-ink"
                        : "border-line text-ink-soft hover:text-ink-muted"
                    }`}
                  >
                    {kind}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-soft">Length</span>
            <div className="flex items-center gap-0.5 rounded-[9px] border border-line bg-surface p-[3px]">
              <Stepper label="−" onClick={() => setMinutes(-1)} disabled={topic.minutes <= 1} />
              <span className="min-w-[50px] text-center text-[13px] font-semibold text-ink">
                {topic.minutes} min
              </span>
              <Stepper label="+" onClick={() => setMinutes(1)} disabled={topic.minutes >= 60} />
            </div>
          </div>

          <label className="flex items-center gap-2.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-soft">Flag</span>
            <select
              value={topic.updated}
              onChange={(e) => onTopicChange((t) => void (t.updated = e.target.value))}
              aria-label="Lesson flag"
              className="rounded-[8px] border border-line bg-surface px-2.5 py-[5px] font-mono text-[11px] text-ink-muted outline-none focus:border-accent"
            >
              {UPDATED_FLAGS.map((flag) => (
                <option key={flag} value={flag}>
                  {flag || "None"}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* summary + filename — secondary metadata kept from the form editor */}
        <div className="mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="block">
            <span className={monoLabelClass}>Summary</span>
            <input
              className={fieldClass}
              placeholder="Shown in the course outline."
              value={topic.description}
              onChange={(e) => onTopicChange((t) => void (t.description = e.target.value))}
            />
          </label>
          <label className="block">
            <span className={monoLabelClass}>Filename</span>
            <div className="flex items-center gap-1.5">
              <input
                className={`${fieldClass} font-mono !text-[12px]`}
                value={topic.slug}
                onChange={(e) => onSlugChange(e.target.value)}
                aria-label="Lesson filename"
              />
              <span className="font-mono text-[11px] text-ink-soft">.html</span>
            </div>
          </label>
        </div>

        {/* content blocks */}
        <div className="flex flex-col gap-[22px]">
          {sections.length === 0 ? (
            <EmptyStart onApplyTemplate={onApplyTemplate} />
          ) : (
            sections.map((type, index) => (
              <Block
                key={type}
                type={type}
                marker={index + 1}
                autoFocus={type === autoFocusType}
                topic={topic}
                onTopicChange={onTopicChange}
                onRemove={() => onRemoveSection(type)}
              />
            ))
          )}

          <AddBlock active={sections} onAdd={onAddSection} />
        </div>
      </div>
    </main>
  );
}

function Stepper({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label === "+" ? "Add a minute" : "Remove a minute"}
      className="grid h-[26px] w-[26px] place-items-center rounded-md text-[16px] leading-none text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {label}
    </button>
  );
}

/* ── One content block: S-marker row + editor ───────────────────────────── */

function Block({
  type,
  marker,
  autoFocus,
  topic,
  onTopicChange,
  onRemove,
}: {
  type: SectionType;
  marker: number;
  autoFocus: boolean;
  topic: TopicDraft;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
  onRemove: () => void;
}) {
  return (
    <div className="section-in" style={{ "--i": marker - 1 } as CSSProperties}>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[12px] font-semibold text-accent">S{marker}</span>
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft">
          {SECTION_LABEL[type]}
        </span>
        <button
          type="button"
          onClick={onRemove}
          title="Remove block"
          aria-label={`Remove ${SECTION_LABEL[type]} block`}
          className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded text-ink-soft transition-colors hover:bg-status-error-soft hover:text-status-error"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>
      <BlockEditor type={type} autoFocus={autoFocus} topic={topic} onTopicChange={onTopicChange} />
    </div>
  );
}

function BlockEditor({
  type,
  autoFocus,
  topic,
  onTopicChange,
}: {
  type: SectionType;
  autoFocus: boolean;
  topic: TopicDraft;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
}) {
  switch (type) {
    case "scene":
      return (
        <div className="rounded-[14px] border border-line bg-surface px-[18px] py-4">
          <textarea
            rows={4}
            autoFocus={autoFocus}
            className={blockTextareaClass}
            placeholder="Describe the client situation and their problem…"
            value={topic.scenario}
            onChange={(e) => onTopicChange((t) => void (t.scenario = e.target.value))}
          />
        </div>
      );

    case "rule":
      return (
        <div className="rounded-[14px] border border-line bg-surface px-[18px] py-4">
          <textarea
            rows={4}
            autoFocus={autoFocus}
            className={blockTextareaClass}
            placeholder="The law, stated plainly…"
            value={topic.rule}
            onChange={(e) => onTopicChange((t) => void (t.rule = e.target.value))}
          />
          <RuleCallout topic={topic} onTopicChange={onTopicChange} />
        </div>
      );

    case "changed": {
      const changed = topic.whatChanged;
      if (!changed) return null;
      return (
        <div className="space-y-3 rounded-[14px] border border-status-warn-soft bg-status-warn-soft px-[18px] py-4">
          <Field label="Heading">
            <input
              autoFocus={autoFocus}
              className={fieldClass}
              placeholder="What changed, in one line…"
              value={changed.heading}
              onChange={(e) => onTopicChange((t) => void (t.whatChanged!.heading = e.target.value))}
            />
          </Field>
          <Field label="Body">
            <textarea
              rows={3}
              className={`${fieldClass} resize-y leading-relaxed`}
              placeholder="Describe what changed and when…"
              value={changed.body}
              onChange={(e) => onTopicChange((t) => void (t.whatChanged!.body = e.target.value))}
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Field label="Pill" hint='e.g. "Law changed · 3 days ago"'>
              <input
                className={fieldClass}
                value={changed.pill}
                onChange={(e) => onTopicChange((t) => void (t.whatChanged!.pill = e.target.value))}
              />
            </Field>
            <Field label="Citation" hint='e.g. "Ch. 167 · effective immediately"'>
              <input
                className={fieldClass}
                value={changed.meta}
                onChange={(e) => onTopicChange((t) => void (t.whatChanged!.meta = e.target.value))}
              />
            </Field>
          </div>
        </div>
      );
    }

    case "media":
      return (
        <div className="rounded-[14px] border border-line bg-surface px-[18px] py-4">
          <MediaList topic={topic} onTopicChange={onTopicChange} />
        </div>
      );

    case "interactive":
      return <InteractiveBlocks topic={topic} onTopicChange={onTopicChange} />;

    case "tryit":
      return <TryItEditor autoFocus={autoFocus} topic={topic} onTopicChange={onTopicChange} />;

    case "remember":
      return (
        <div className="rounded-[14px] border border-brand-fill/25 bg-brand-tint px-[18px] py-4">
          <textarea
            rows={3}
            autoFocus={autoFocus}
            className={blockTextareaClass}
            placeholder={"The single most important thing to remember…\nOne per line."}
            value={topic.remember.join("\n")}
            onChange={(e) => onTopicChange((t) => void (t.remember = e.target.value.split("\n")))}
          />
        </div>
      );
  }
}

/* ── Try-it block ───────────────────────────────────────────────────────── */

function TryItEditor({
  autoFocus,
  topic,
  onTopicChange,
}: {
  autoFocus: boolean;
  topic: TopicDraft;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
}) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-5">
      <textarea
        rows={2}
        autoFocus={autoFocus}
        className="w-full resize-y border-none bg-transparent font-display text-[18px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink outline-none placeholder:text-ink-soft"
        placeholder="Your question here…"
        value={topic.tryIt.question}
        onChange={(e) => onTopicChange((t) => void (t.tryIt.question = e.target.value))}
      />
      <div className="mb-[9px] mt-3.5 font-mono text-[10px] uppercase tracking-[0.07em] text-ink-soft">
        Tap the circle by the right answer
      </div>
      <div className="flex flex-col gap-2">
        {topic.tryIt.options.map((option, i) => (
          <div
            key={i}
            className={`flex items-center gap-[11px] rounded-[11px] border px-[15px] py-3 transition-colors ${
              option.correct
                ? "border-accent bg-[var(--accent-tint)]"
                : "border-line bg-surface-sunken"
            }`}
          >
            <button
              type="button"
              onClick={() => onTopicChange((t) => t.tryIt.options.forEach((o, j) => (o.correct = j === i)))}
              aria-label={`Mark option ${i + 1} correct`}
              aria-pressed={option.correct}
              className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 transition-colors ${
                option.correct ? "border-accent bg-accent" : "border-line-strong"
              }`}
            >
              {option.correct ? (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M2.5 6.5L5 9l4.5-5" />
                </svg>
              ) : null}
            </button>
            <input
              className="min-w-0 flex-1 border-none bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-soft"
              placeholder={`Option ${i + 1}`}
              value={option.text}
              onChange={(e) => onTopicChange((t) => void (t.tryIt.options[i].text = e.target.value))}
            />
            <button
              type="button"
              onClick={() => onTopicChange((t) => void t.tryIt.options.splice(i, 1))}
              disabled={topic.tryIt.options.length <= 2}
              className="shrink-0 rounded p-1 text-ink-soft transition-colors hover:text-status-error disabled:opacity-30"
              aria-label="Remove option"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      {topic.tryIt.options.length < 6 ? (
        <button
          type="button"
          onClick={() => onTopicChange((t) => void t.tryIt.options.push({ text: "", correct: false }))}
          className="mt-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-accent hover:underline"
        >
          + Add option
        </button>
      ) : null}
      <div className="mt-3.5">
        <Field label="Answer explanation" hint="Shown after the learner chooses.">
          <textarea
            rows={2}
            className={`${fieldClass} resize-y leading-relaxed`}
            value={topic.tryIt.answer}
            onChange={(e) => onTopicChange((t) => void (t.tryIt.answer = e.target.value))}
          />
        </Field>
      </div>
    </div>
  );
}

/* ── Rule callout (progressive disclosure) ──────────────────────────────── */

function RuleCallout({
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
        className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-accent hover:underline"
      >
        + Add numbered call-out box
      </button>
    );
  }

  return (
    <div className="mt-3.5 space-y-3 border-t border-line-soft pt-3.5">
      <Field label="Call-out box label" hint="Optional callout under the rule.">
        <input
          className={fieldClass}
          placeholder='e.g. "The notice must state"'
          value={topic.ruleBoxLabel}
          onChange={(e) => onTopicChange((t) => void (t.ruleBoxLabel = e.target.value))}
        />
      </Field>
      <Field label="Items" hint="One numbered item per line.">
        <textarea
          rows={3}
          className={`${fieldClass} resize-y leading-relaxed`}
          value={topic.ruleBoxItems.join("\n")}
          onChange={(e) => onTopicChange((t) => void (t.ruleBoxItems = e.target.value.split("\n")))}
        />
      </Field>
    </div>
  );
}

/* ── Media placeholders ─────────────────────────────────────────────────── */

function MediaList({
  topic,
  onTopicChange,
}: {
  topic: TopicDraft;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11.5px] leading-relaxed text-ink-soft">
        Name the image file and where it goes. The export adds an{" "}
        <code className="font-mono text-[11px]">images/README.txt</code> listing what to drop in
        before uploading to Brightspace.
      </p>
      {(topic.media ?? []).map((media, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_auto_auto]">
          <input
            className={fieldClass}
            placeholder="filename.png"
            value={media.filename}
            onChange={(e) => onTopicChange((t) => void (t.media[i].filename = e.target.value))}
          />
          <input
            className={fieldClass}
            placeholder="Alt text (what the image shows)"
            value={media.alt}
            onChange={(e) => onTopicChange((t) => void (t.media[i].alt = e.target.value))}
          />
          <select
            className={fieldClass}
            value={media.placement}
            onChange={(e) =>
              onTopicChange((t) => void (t.media[i].placement = e.target.value as "scenario" | "rule"))
            }
            aria-label="Placement"
          >
            <option value="scenario">after Scene</option>
            <option value="rule">after Rule</option>
          </select>
          <button
            type="button"
            onClick={() => onTopicChange((t) => void t.media.splice(i, 1))}
            className="rounded p-1 text-ink-soft transition-colors hover:text-status-error"
            aria-label="Remove image"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
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
        className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-accent hover:underline"
      >
        + Add image placeholder
      </button>
    </div>
  );
}

/* ── Interactive content blocks ─────────────────────────────────────────────
   A repeatable, reorderable list of rich elements (the "Interactive" section).
   Each block carries its own editor; the export renders them in this order. */

function InteractiveBlocks({
  topic,
  onTopicChange,
}: {
  topic: TopicDraft;
  onTopicChange: (fn: (topic: TopicDraft) => void) => void;
}) {
  const blocks = topic.blocks ?? [];

  function addBlock(type: ContentBlockType) {
    onTopicChange((t) => {
      if (!t.blocks) t.blocks = [];
      t.blocks.push(emptyBlock(type));
    });
  }
  function removeBlock(i: number) {
    onTopicChange((t) => void t.blocks?.splice(i, 1));
  }
  function moveBlock(i: number, dir: -1 | 1) {
    onTopicChange((t) => {
      const arr = t.blocks;
      if (!arr) return;
      const j = i + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    });
  }
  /* A mutator scoped to block i, re-narrowed to its variant so edits are type-safe. */
  function mutateBlock<K extends ContentBlockType>(i: number, type: K, fn: (block: BlockOf<K>) => void) {
    onTopicChange((t) => {
      const block = t.blocks?.[i];
      if (block && block.type === type) fn(block as BlockOf<K>);
    });
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const meta = BLOCK_TYPES.find((b) => b.type === block.type);
        return (
          <div key={i} className="rounded-[14px] border border-line bg-surface px-[18px] py-3.5">
            <div className="mb-3 flex items-center gap-2">
              <span aria-hidden>{meta?.emoji}</span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                {meta?.name ?? block.type}
              </span>
              <span className="flex-1" />
              <RowIconButton
                label="Move up"
                onClick={() => moveBlock(i, -1)}
                disabled={i === 0}
                path="M8 3.5v9M4.5 7L8 3.5 11.5 7"
              />
              <RowIconButton
                label="Move down"
                onClick={() => moveBlock(i, 1)}
                disabled={i === blocks.length - 1}
                path="M8 12.5v-9M4.5 9L8 12.5 11.5 9"
              />
              <RowIconButton
                label="Remove element"
                onClick={() => removeBlock(i)}
                danger
                path="M2 2l8 8M10 2l-8 8"
              />
            </div>

            {block.type === "accordion" ? (
              <PairList
                rows={block.items}
                keyA="title"
                keyB="body"
                placeholderA="Section title"
                placeholderB="Hidden until the learner expands this section…"
                addLabel="+ Add section"
                mutate={(fn) => mutateBlock(i, "accordion", (b) => fn(b.items))}
              />
            ) : block.type === "reveal" ? (
              <PairList
                rows={block.items}
                keyA="prompt"
                keyB="body"
                placeholderA="Prompt (e.g. a question)"
                placeholderB="The answer, revealed on click…"
                addLabel="+ Add reveal"
                mutate={(fn) => mutateBlock(i, "reveal", (b) => fn(b.items))}
              />
            ) : block.type === "timeline" ? (
              <PairList
                rows={block.steps}
                keyA="label"
                keyB="body"
                placeholderA="Step label (e.g. a date or stage)"
                placeholderB="What happens at this step…"
                addLabel="+ Add step"
                mutate={(fn) => mutateBlock(i, "timeline", (b) => fn(b.steps))}
              />
            ) : block.type === "callout" ? (
              <CalloutEditor block={block} mutate={(fn) => mutateBlock(i, "callout", fn)} />
            ) : (
              <QuoteEditor block={block} mutate={(fn) => mutateBlock(i, "quote", fn)} />
            )}
          </div>
        );
      })}

      <AddInteractive onAdd={addBlock} />
    </div>
  );
}

function AddInteractive({ onAdd }: { onAdd: (type: ContentBlockType) => void }) {
  return (
    <div className="rounded-[12px] border border-dashed border-line-strong p-2.5">
      <div className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.07em] text-ink-soft">
        Add an element
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {BLOCK_TYPES.map((b) => (
          <button
            key={b.type}
            type="button"
            onClick={() => onAdd(b.type)}
            title={b.hint}
            className="flex items-center gap-2 rounded-[9px] border border-line bg-surface px-2.5 py-2 text-left transition-colors hover:border-accent hover:bg-[var(--accent-tint)]"
          >
            <span aria-hidden>{b.emoji}</span>
            <span className="truncate text-[12px] font-semibold text-ink">{b.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* A small icon button used in block headers (move / remove). */
function RowIconButton({
  label,
  onClick,
  path,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  path: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded text-ink-soft transition-colors disabled:opacity-25 ${
        danger ? "hover:bg-status-error-soft hover:text-status-error" : "hover:bg-surface-sunken hover:text-ink"
      }`}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={path} />
      </svg>
    </button>
  );
}

/* Repeatable two-field rows (short label + body) — shared by accordion,
   click-&-reveal, and timeline, which differ only in field names + copy. */
function PairList({
  rows,
  keyA,
  keyB,
  placeholderA,
  placeholderB,
  addLabel,
  mutate,
}: {
  rows: Record<string, string>[];
  keyA: string;
  keyB: string;
  placeholderA: string;
  placeholderB: string;
  addLabel: string;
  mutate: (fn: (rows: Record<string, string>[]) => void) => void;
}) {
  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => (
        <div key={i} className="rounded-[10px] border border-line bg-surface-sunken p-2.5">
          <div className="flex items-center gap-1.5">
            <input
              className={`${fieldClass} flex-1`}
              placeholder={placeholderA}
              value={row[keyA] ?? ""}
              onChange={(e) => mutate((r) => void (r[i][keyA] = e.target.value))}
            />
            <button
              type="button"
              onClick={() => mutate((r) => void r.splice(i, 1))}
              disabled={rows.length <= 1}
              className="shrink-0 rounded p-1 text-ink-soft transition-colors hover:text-status-error disabled:opacity-30"
              aria-label="Remove row"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </div>
          <textarea
            rows={2}
            className={`${fieldClass} mt-2 resize-y leading-relaxed`}
            placeholder={placeholderB}
            value={row[keyB] ?? ""}
            onChange={(e) => mutate((r) => void (r[i][keyB] = e.target.value))}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => mutate((r) => void r.push({ [keyA]: "", [keyB]: "" }))}
        className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-accent hover:underline"
      >
        {addLabel}
      </button>
    </div>
  );
}

function CalloutEditor({
  block,
  mutate,
}: {
  block: BlockOf<"callout">;
  mutate: (fn: (block: BlockOf<"callout">) => void) => void;
}) {
  const variants: { value: BlockOf<"callout">["variant"]; label: string }[] = [
    { value: "info", label: "Info" },
    { value: "tip", label: "Tip" },
    { value: "warn", label: "Warning" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        {variants.map((v) => {
          const active = block.variant === v.value;
          return (
            <button
              key={v.value}
              type="button"
              onClick={() => mutate((b) => void (b.variant = v.value))}
              className={`rounded-lg border px-3 py-[5px] text-[12px] font-semibold transition-colors ${
                active ? "border-accent bg-[var(--accent-tint)] text-accent-ink" : "border-line text-ink-soft hover:text-ink-muted"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
      <input
        className={fieldClass}
        placeholder="Callout heading (optional)"
        value={block.title}
        onChange={(e) => mutate((b) => void (b.title = e.target.value))}
      />
      <textarea
        rows={3}
        className={`${fieldClass} resize-y leading-relaxed`}
        placeholder="The note, tip, or warning…"
        value={block.body}
        onChange={(e) => mutate((b) => void (b.body = e.target.value))}
      />
    </div>
  );
}

function QuoteEditor({
  block,
  mutate,
}: {
  block: BlockOf<"quote">;
  mutate: (fn: (block: BlockOf<"quote">) => void) => void;
}) {
  return (
    <div className="space-y-3">
      <textarea
        rows={3}
        className={`${fieldClass} resize-y leading-relaxed`}
        placeholder="The quote…"
        value={block.text}
        onChange={(e) => mutate((b) => void (b.text = e.target.value))}
      />
      <input
        className={fieldClass}
        placeholder="Attribution (e.g. a statute, judge, or source)"
        value={block.attribution}
        onChange={(e) => mutate((b) => void (b.attribution = e.target.value))}
      />
    </div>
  );
}

/* ── Empty-lesson starter ───────────────────────────────────────────────── */

function EmptyStart({
  onApplyTemplate,
}: {
  onApplyTemplate: (name: keyof typeof TEMPLATES) => void;
}) {
  return (
    <div className="rounded-[14px] border border-dashed border-line-strong px-6 py-8 text-center">
      <p className="font-display text-[16px] font-semibold text-ink-muted">Build this lesson</p>
      <p className="mt-1 text-[13px] text-ink-soft">Start from a shape, or add a block below.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {(Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onApplyTemplate(name)}
            className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-ink-muted transition-colors hover:border-accent hover:bg-[var(--accent-tint)] hover:text-accent-ink"
          >
            {TEMPLATES[name].label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Add-block button + picker ──────────────────────────────────────────── */

function AddBlock({
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

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-center gap-[9px] rounded-[14px] border border-dashed px-4 py-[17px] text-[13.5px] font-semibold transition-colors ${
          open
            ? "border-accent bg-[var(--accent-tint)] text-accent-ink"
            : "border-line-strong text-ink-soft hover:border-accent hover:bg-[var(--accent-tint)] hover:text-accent-ink"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M8 3v10M3 8h10" />
        </svg>
        Add something to this lesson
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 grid grid-cols-2 gap-1 rounded-[14px] border border-line bg-surface p-2 shadow-[var(--shadow-lg)]">
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
                className="flex items-center gap-[9px] rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-surface-sunken disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[7px] bg-surface-sunken text-sm" aria-hidden>
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

/* ── Small labeled field ────────────────────────────────────────────────── */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </span>
      {hint ? <span className="mb-1.5 block text-[11px] text-ink-soft">{hint}</span> : null}
      {children}
    </label>
  );
}
