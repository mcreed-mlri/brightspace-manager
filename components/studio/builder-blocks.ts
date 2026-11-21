import type { CSSProperties } from "react";
import type { ContentBlockType, TopicDraft, TopicFamily } from "@/types/studio";

/* Design handoff v3 section system, mapped onto the TopicDraft model.
   The design's dynamic section list corresponds 1:1 to the draft's fixed
   fields, so "adding a section" reveals an editor for that field and
   "removing" clears it — the export pipeline stays untouched. */

export type SectionType =
  "scene" | "rule" | "changed" | "media" | "interactive" | "tryit" | "remember";

/* Canonical render/export order — sections always appear in this order
   regardless of the order they were added. The interactive band sits after
   the rule/media build-up and before the try-it climax. */
export const SECTION_ORDER: SectionType[] = [
  "scene",
  "rule",
  "changed",
  "media",
  "interactive",
  "tryit",
  "remember",
];

export const BLOCKS: Record<
  SectionType,
  {
    name: string;
    hint: string;
    emoji: string;
    accent: "warn" | "info" | null;
    previewLabel: string;
  }
> = {
  scene: {
    name: "Set the scene",
    hint: "A real client, a real moment.",
    emoji: "📍",
    accent: null,
    previewLabel: "The Scenario",
  },
  rule: {
    name: "State the rule",
    hint: "The law, in plain language.",
    emoji: "⚖️",
    accent: null,
    previewLabel: "The Rule",
  },
  changed: {
    name: "What changed",
    hint: "Only when the law moved.",
    emoji: "🔄",
    accent: "warn",
    previewLabel: "What Changed",
  },
  media: {
    name: "Media",
    hint: "Image placeholders. Files drop in at upload time.",
    emoji: "🖼",
    accent: null,
    previewLabel: "Media",
  },
  interactive: {
    name: "Interactive",
    hint: "Accordions, callouts, timelines: rich elements, any number.",
    emoji: "🧩",
    accent: null,
    previewLabel: "Interactive",
  },
  tryit: {
    name: "Try it",
    hint: "One question, the climax of the lesson.",
    emoji: "🎯",
    accent: null,
    previewLabel: "Try It",
  },
  remember: {
    name: "Remember",
    hint: "The 2–3 things that must stick.",
    emoji: "💡",
    accent: "info",
    previewLabel: "Remember",
  },
};

/* Palette for the Interactive section's per-element picker. Order here is the
   order shown in the "add element" menu. Phase 1 = the five JS-free elements. */
export const BLOCK_TYPES: { type: ContentBlockType; name: string; emoji: string; hint: string }[] =
  [
    { type: "accordion", name: "Accordion", emoji: "📂", hint: "Collapsible titled sections." },
    {
      type: "reveal",
      name: "Click & Reveal",
      emoji: "👆",
      hint: "Hidden answers behind a prompt.",
    },
    { type: "callout", name: "Callout", emoji: "📣", hint: "A boxed note, tip, or warning." },
    { type: "timeline", name: "Timeline", emoji: "📈", hint: "Ordered steps or milestones." },
    { type: "quote", name: "Stylized quote", emoji: "❝", hint: "A pulled quote with attribution." },
  ];

export const TEMPLATES: Record<string, { label: string; sections: SectionType[] }> = {
  standard: { label: "Standard lesson", sections: ["scene", "rule", "tryit"] },
  lawupdate: { label: "Law update", sections: ["scene", "rule", "changed", "tryit"] },
  quickref: { label: "Quick ref", sections: ["rule", "remember"] },
};

/* Sections that hold content in the draft — these are always shown
   (hiding one without clearing it would still export). */
export function sectionsWithContent(topic: TopicDraft): SectionType[] {
  const out: SectionType[] = [];
  if (topic.scenario.trim()) out.push("scene");
  if (
    topic.rule.trim() ||
    topic.ruleBoxLabel.trim() ||
    topic.ruleBoxItems.some((item) => item.trim())
  ) {
    out.push("rule");
  }
  if (topic.whatChanged) out.push("changed");
  if ((topic.media ?? []).length > 0) out.push("media");
  if ((topic.blocks ?? []).length > 0) out.push("interactive");
  if (
    topic.tryIt.question.trim() ||
    topic.tryIt.answer.trim() ||
    topic.tryIt.options.some((option) => option.text.trim())
  ) {
    out.push("tryit");
  }
  if (topic.remember.some((line) => line.trim())) out.push("remember");
  return out;
}

/* Effective section list: content-bearing ∪ explicitly added, in canonical order. */
export function activeSections(topic: TopicDraft, added: SectionType[]): SectionType[] {
  const present = new Set([...sectionsWithContent(topic), ...added]);
  return SECTION_ORDER.filter((type) => present.has(type));
}

/* ── Per-course topic colour ─────────────────────────────────────────────────
   The Course Details "Topic family" picker sets the course's colour: the
   Training Hub's topic families (its app/styles/tokens.css, ADR 0015),
   defined in globals.css as --hue-1..8, so a course looks the same here as in
   the Hub's catalog. A hue's bright `solid` is for fills, rules and swatches;
   any text in that colour takes its `ink`. */
const FAMILY_HUE: Partial<Record<TopicFamily, number>> = {
  foundations: 1,
  ethics: 2,
  drafting: 3,
  research: 4,
  court: 6,
  trauma: 7,
  client: 8,
};

/* The swatch shown beside the Topic family picker. */
export function familyColor(family: TopicFamily): string {
  const hue = FAMILY_HUE[family];
  return hue ? `var(--hue-${hue})` : "var(--accent)";
}

/* The family colour as --family / --family-ink / --family-tint on the builder
   root. The Hub uses a category colour only for small accents (a rule over an
   item, a swatch, a label in the hue's ink), never to repaint the chrome, so
   the builder keeps the Hub's sky for selection and ink for actions, and
   only the lesson's colour rule and eyebrow read these. */
export function familyAccentStyle(family: TopicFamily): CSSProperties {
  const hue = FAMILY_HUE[family];
  if (!hue) {
    return {
      "--family": "var(--line-strong)",
      "--family-ink": "var(--ink-soft)",
      "--family-tint": "var(--surface-sunken)",
    } as CSSProperties;
  }
  return {
    "--family": `var(--hue-${hue})`,
    "--family-ink": `var(--hue-${hue}-ink)`,
    "--family-tint": `var(--hue-${hue}-tint)`,
  } as CSSProperties;
}

/* Clear a section's underlying draft fields (called on remove). */
export function clearSection(topic: TopicDraft, type: SectionType) {
  switch (type) {
    case "scene":
      topic.scenario = "";
      break;
    case "rule":
      topic.rule = "";
      topic.ruleBoxLabel = "";
      topic.ruleBoxItems = [];
      break;
    case "changed":
      topic.whatChanged = null;
      break;
    case "media":
      topic.media = [];
      break;
    case "interactive":
      topic.blocks = [];
      break;
    case "tryit":
      topic.tryIt = {
        question: "",
        options: [
          { text: "", correct: false },
          { text: "", correct: true },
          { text: "", correct: false },
        ],
        answer: "",
      };
      break;
    case "remember":
      topic.remember = [];
      break;
  }
}
