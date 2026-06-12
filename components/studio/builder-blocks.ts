import type { TopicDraft } from "@/types/studio";

/* Design handoff v3 section system, mapped onto the TopicDraft model.
   The design's dynamic section list corresponds 1:1 to the draft's fixed
   fields, so "adding a section" reveals an editor for that field and
   "removing" clears it — the export pipeline stays untouched. */

export type SectionType = "scene" | "rule" | "changed" | "media" | "tryit" | "remember";

/* Canonical render/export order — sections always appear in this order
   regardless of the order they were added. */
export const SECTION_ORDER: SectionType[] = [
  "scene",
  "rule",
  "changed",
  "media",
  "tryit",
  "remember",
];

export const BLOCKS: Record<
  SectionType,
  { name: string; hint: string; emoji: string; accent: "warn" | "info" | null; previewLabel: string }
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
    hint: "Image placeholders — files drop in at upload time.",
    emoji: "🖼",
    accent: null,
    previewLabel: "Media",
  },
  tryit: {
    name: "Try it",
    hint: "One question — the climax of the lesson.",
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
