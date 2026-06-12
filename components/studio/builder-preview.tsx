"use client";

import type { CourseDraft, TopicDraft } from "@/types/studio";
import {
  BLOCKS,
  activeSections,
  type SectionType,
} from "@/components/studio/builder-blocks";

/* Pane 3 — live preview, a mocked learner card that re-renders from form
   state on every keystroke. No API call; the real preview (full wrapper
   styles) stays behind the Preview button in the top bar. */

function excerpt(text: string, max: number): string {
  const line = (text || "").split("\n").find((l) => l.trim()) ?? "";
  if (!line) return "—";
  return line.length > max ? `${line.slice(0, max)}…` : line;
}

function sectionExcerpt(topic: TopicDraft, type: SectionType): string {
  switch (type) {
    case "scene":
      return excerpt(topic.scenario, 100);
    case "rule":
      return excerpt(topic.rule, 90);
    case "changed":
      return excerpt(topic.whatChanged?.heading || topic.whatChanged?.body || "", 90);
    case "media": {
      const named = (topic.media ?? []).filter((m) => m.filename.trim());
      return named.length
        ? named.map((m) => m.filename).join(", ")
        : `${(topic.media ?? []).length} placeholder(s)`;
    }
    case "tryit":
      return excerpt(topic.tryIt.question, 90);
    case "remember":
      return excerpt(topic.remember.join("\n"), 90);
  }
}

export function BuilderPreview({
  draft,
  topic,
  added,
  lessonIndex,
  lessonTotal,
}: {
  draft: CourseDraft;
  topic: TopicDraft;
  added: SectionType[];
  lessonIndex: number;
  lessonTotal: number;
}) {
  const sections = activeSections(topic, added).filter(
    (type) => sectionExcerpt(topic, type) !== "—",
  );
  const pipCount = Math.min(lessonTotal, 6);
  const donePips = lessonTotal <= pipCount ? lessonIndex + 1 : Math.ceil(((lessonIndex + 1) / lessonTotal) * pipCount);

  return (
    <div className="flex w-[360px] shrink-0 flex-col overflow-hidden border-l border-line bg-[#f0f0ec]">
      <div className="flex shrink-0 items-center justify-between border-b border-black/[0.07] bg-[#f0f0ec]/90 px-4 py-2.5">
        <span className="text-[11.5px] font-medium text-ink-muted">
          Live preview · as a learner sees it
        </span>
        <span className="text-[11px] italic text-ink-soft">updates as you type</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-2.5 border-b border-[#eee] bg-white px-3.5 py-[11px]">
            <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-md bg-brand-fill text-[10.5px] font-bold text-white">
              L
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[9.5px] font-bold uppercase leading-none tracking-[0.09em] text-status-ok">
                {draft.courseArea || draft.topic}
              </span>
              <span className="mt-0.5 block truncate text-[12.5px] font-bold leading-tight text-ink">
                {draft.courseTitle || "Untitled course"}
              </span>
            </span>
            <span className="flex shrink-0 gap-[3px]" aria-hidden>
              {Array.from({ length: pipCount }, (_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-sm ${i < donePips ? "bg-brand-fill" : "bg-line"}`}
                />
              ))}
            </span>
          </div>
          <div className="p-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="flex items-center gap-1 rounded-full bg-brand-tint px-2 py-[3px] text-[10px] font-bold text-brand">
                ● {topic.kind} &nbsp;⏱ {topic.minutes} min
              </span>
              {topic.updated ? (
                <span className="rounded-full bg-status-warn-soft px-2 py-[3px] text-[10px] font-bold text-status-warn">
                  {topic.updated}
                </span>
              ) : null}
            </div>
            <h3 className="mb-2.5 text-xl font-extrabold leading-tight tracking-[-0.025em] text-[#1a1a1a]">
              {topic.title || "Untitled lesson"}
            </h3>
            {topic.standfirst.trim() ? (
              <p className="mb-4 text-[13px] leading-[1.65] text-[#444]">{topic.standfirst}</p>
            ) : null}
            {sections.map((type, index) => (
              <div key={type} className="mb-3.5 last:mb-0">
                <p className="mb-2 flex items-center gap-[5px] text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-status-ok">
                  <span className="text-[9px] opacity-60">§{index + 1}</span>
                  {BLOCKS[type].previewLabel}
                </p>
                <p className="text-[12.5px] leading-[1.72] text-[#333]">
                  {sectionExcerpt(topic, type)}
                </p>
              </div>
            ))}
            {sections.length === 0 ? (
              <p className="text-[12.5px] italic leading-[1.72] text-ink-soft">
                Add sections on the left and they&apos;ll appear here.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
