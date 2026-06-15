"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CourseDraft, TopicDraft } from "@/types/studio";
import { activeSections, type SectionType } from "@/components/studio/builder-blocks";
import { escapeHtml, inline, paragraphs } from "@/lib/studio/inline";

/* Pane 3 — live preview in the REAL wrapper design. An iframe loads the
   actual course-style.css from the template repo (via /api/studio/template/css)
   and we render the same markup the exporter writes (section-rule, rule-box,
   changed-box, tryit-box, remember-box). When Marlana restyles the wrapper,
   the preview follows with zero changes here. Keystrokes only swap
   body.innerHTML — the stylesheet and fonts load once. */

const SECTION_LABELS: Record<SectionType, string> = {
  scene: "The scenario",
  rule: "The rule",
  changed: "What changed",
  media: "Media",
  tryit: "Try it",
  remember: "If you remember nothing else",
};

function sectionRule(num: number, label: string, rust = false): string {
  return `<div class="section-rule${rust ? " rust" : ""}">
    <span class="sr-num">§ ${num}</span><span class="sr-line"></span><span class="sr-label">${escapeHtml(label)}</span>
  </div>`;
}

function emptyHint(text: string): string {
  return `<p class="prose" style="color:var(--muted-soft);font-style:italic;">${escapeHtml(text)}</p>`;
}

function mediaPlaceholders(topic: TopicDraft, placement: "scenario" | "rule"): string {
  return (topic.media ?? [])
    .filter((m) => m.placement === placement && (m.filename.trim() || m.alt.trim()))
    .map(
      (m) => `<figure style="margin:1.25rem 0;">
        <div style="border:1.5px dashed var(--hair-strong);border-radius:10px;padding:20px 16px;text-align:center;color:var(--muted-soft);font-size:0.8rem;background:var(--warm);">
          🖼 ${escapeHtml(m.filename.trim() || "image")}${m.alt.trim() ? ` — ${escapeHtml(m.alt)}` : ""}
        </div>${
          m.caption.trim()
            ? `\n        <figcaption style="margin-top:0.5rem;font-size:0.8rem;color:var(--muted);">${inline(m.caption)}</figcaption>`
            : ""
        }
      </figure>`,
    )
    .join("\n");
}

function sectionHtml(type: SectionType, num: number, topic: TopicDraft): string {
  switch (type) {
    case "scene":
      return `<section class="section">${sectionRule(num, SECTION_LABELS.scene)}
        ${paragraphs(topic.scenario) || emptyHint("Describe the client situation…")}
        ${mediaPlaceholders(topic, "scenario")}</section>`;

    case "rule": {
      const items = topic.ruleBoxItems.filter((i) => i.trim());
      const ruleBox = items.length
        ? `<div class="rule-box"><div class="eyebrow">${inline(topic.ruleBoxLabel || "The rule")}</div>
            <ol>${items.map((i) => `<li>${inline(i)}</li>`).join("")}</ol></div>`
        : "";
      return `<section class="section">${sectionRule(num, SECTION_LABELS.rule)}
        ${paragraphs(topic.rule) || emptyHint("The law, stated plainly…")}
        ${ruleBox}${mediaPlaceholders(topic, "rule")}</section>`;
    }

    case "changed": {
      const wc = topic.whatChanged;
      if (!wc) return "";
      return `<section class="section">${sectionRule(num, SECTION_LABELS.changed, true)}
        <div class="changed-box">
          <div class="cb-meta">
            <span class="pill pill-rust">${inline(wc.pill || "Law changed")}</span>
            ${wc.meta.trim() ? `<span class="eyebrow eyebrow-muted">${inline(wc.meta)}</span>` : ""}
          </div>
          <h3>${inline(wc.heading) || '<span style="color:var(--muted-soft);font-style:italic;">What changed, in one line…</span>'}</h3>
          <p>${inline(wc.body).replace(/\r?\n/g, " ")}</p>
        </div></section>`;
    }

    case "media":
      /* standalone media block (figures placed mid-lesson render with their
         host section above; anything unplaced shows here) */
      return "";

    case "tryit": {
      const options = topic.tryIt.options
        .filter((o) => o.text.trim())
        .map(
          (o) => `<button class="tryit-option${o.correct ? " correct" : ""}" type="button" style="pointer-events:none;">
            <span class="tryit-radio"></span>
            <span>${inline(o.text)}</span>
          </button>`,
        )
        .join("\n");
      return `<section class="section">${sectionRule(num, SECTION_LABELS.tryit)}
        <p class="prose" style="font-style:italic;color:var(--muted);">One question. You'll see the answer once you choose.</p>
        <div class="tryit-box">
          <div class="eyebrow">Scenario</div>
          <p class="tryit-q">${inline(topic.tryIt.question) || '<span style="color:var(--muted-soft);font-style:italic;">Your question here…</span>'}</p>
          <div class="tryit-options">${options}</div>${
            topic.tryIt.answer.trim()
              ? `\n          <div class="answer-banner"><span><strong>The answer:</strong> ${inline(topic.tryIt.answer)}</span></div>`
              : ""
          }
        </div></section>`;
    }

    case "remember": {
      const items = topic.remember.filter((r) => r.trim());
      return `<section class="section">${sectionRule(num, SECTION_LABELS.remember)}
        <div class="remember-box"><ul>${
          items.length
            ? items.map((r) => `<li>${inline(r)}</li>`).join("")
            : `<li style="color:var(--muted-soft);font-style:italic;">The 2–3 things that must stick…</li>`
        }</ul></div></section>`;
    }
  }
}

function buildBodyHtml(
  draft: CourseDraft,
  topic: TopicDraft,
  sections: SectionType[],
  lessonIndex: number,
  lessonTotal: number,
): string {
  const progress = Math.round((lessonIndex / Math.max(lessonTotal, 1)) * 100);
  let num = 0;
  const sectionMarkup = sections
    .map((type) => {
      const html = sectionHtml(type, num + 1, topic);
      if (html) num += 1;
      return html;
    })
    .join("\n");

  return `<div class="page">
  <main class="page-body topic-body" style="padding-top:28px;">
    <p class="eyebrow">Topic ${lessonIndex + 1} of ${lessonTotal} · ${escapeHtml(topic.kind)} · ${topic.minutes} min</p>
    <h1 class="display topic-title">${inline(topic.title) || '<span style="color:var(--muted-soft);">Untitled lesson</span>'}</h1>
    <p class="topic-standfirst">${inline(topic.standfirst)}</p>
    <div class="topic-progress">
      <div class="topic-progress-track"><div data-lace="course-progress-bar" style="width:${progress}%;"></div></div>
      <span class="topic-progress-label">${progress}% through this course</span>
    </div>
    ${sectionMarkup || emptyHint("Add sections on the left and they'll appear here, styled exactly like the real course.")}
  </main>
</div>`;
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [css, setCss] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  /* bumped on every iframe (re)load so the paint effect re-runs after the
     shell document replaces the DOM */
  const [frameLoads, setFrameLoads] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/studio/template/css/")
      .then(async (response) => {
        if (cancelled) return;
        if (response.ok) setCss(await response.text());
        else setMissing(true);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = activeSections(topic, added);
  const bodyHtml = buildBodyHtml(draft, topic, sections, lessonIndex, lessonTotal);

  /* The shell document is created once per stylesheet load (empty body);
     every edit only swaps body.innerHTML so fonts/CSS never re-fetch. */
  const shellDoc = useMemo(() => {
    if (!css) return "";
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
      <style>${css}</style>
      <style>html{overflow-x:hidden;} #lace-nav-container{display:none;}</style>
      </head><body></body></html>`;
  }, [css]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !css) return;
    doc.documentElement.dataset.topic = draft.topic;
    if (doc.body && doc.body.innerHTML !== bodyHtml) doc.body.innerHTML = bodyHtml;
  }, [bodyHtml, draft.topic, css, frameLoads]);

  return (
    <div className="flex w-[44%] min-w-[380px] max-w-[640px] shrink-0 flex-col overflow-hidden border-l border-line bg-paper">
      <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface/90 px-4 py-2.5">
        <span className="text-[11.5px] font-medium text-ink-muted">
          Live preview · as a learner sees it
        </span>
        <span className="text-[11px] italic text-ink-soft">
          {missing ? "wrapper template not found" : "real course styles · updates as you type"}
        </span>
      </div>
      {missing ? (
        <div className="flex flex-1 items-start justify-center p-6">
          <p className="max-w-[340px] text-[13px] leading-relaxed text-ink-muted">
            The wrapper template isn&apos;t reachable, so the preview can&apos;t use the real
            course styles. Check <code className="font-mono text-xs">COURSE_TEMPLATE_DIR</code>{" "}
            (local path) or <code className="font-mono text-xs">COURSE_TEMPLATE_URL</code> (GitHub
            raw, for Vercel).
          </p>
        </div>
      ) : css ? (
        <iframe
          ref={iframeRef}
          title="Live lesson preview"
          srcDoc={shellDoc}
          className="h-full w-full flex-1 border-0 bg-white"
          onLoad={() => setFrameLoads((n) => n + 1)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-[13px] text-ink-soft">
          Loading course styles…
        </div>
      )}
    </div>
  );
}
