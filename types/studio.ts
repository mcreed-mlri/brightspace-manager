/* Course Studio draft model — the canonical source of truth for a course.
   The HTML package is a build artifact generated from this; when the wrapper
   look changes, drafts regenerate against the new template untouched. */

export const TOPIC_FAMILIES = [
  "court",
  "client",
  "ethics",
  "research",
  "drafting",
  "trauma",
  "foundations",
] as const;
export type TopicFamily = (typeof TOPIC_FAMILIES)[number];

export const TOPIC_KINDS = ["Concept", "Practice", "Drafting", "Reflection"] as const;
export type TopicKind = (typeof TOPIC_KINDS)[number];

export const UPDATED_FLAGS = ["", "New", "Updated", "Law changed"] as const;

export type TryItOption = {
  text: string;
  correct: boolean;
};

/* A media placeholder: the Studio records WHERE an image goes and its
   filename — the actual file is dropped into the package's images/ folder
   (and later, Brightspace Manage Files). */
export type TopicMedia = {
  /* filename inside images/, e.g. "notice-timeline.png" */
  filename: string;
  alt: string;
  caption: string;
  /* which section the figure appears after */
  placement: "scenario" | "rule";
};

export type WhatChanged = {
  /* e.g. "Law changed · 3 days ago" */
  pill: string;
  /* e.g. "Ch. 167 · effective immediately" */
  meta: string;
  heading: string;
  body: string;
};

/* ── Interactive content blocks ──────────────────────────────────────────────
   A repeatable, ordered list of rich elements (the "Interactive" section).
   Unlike the fixed pedagogical sections, a topic can hold several of these in
   any order — so they live in an array, not as singleton fields. Each variant
   is a Creator+-style element; Phase 1 ships the five that need no wrapper JS
   (they export as self-contained HTML/CSS). Phase 2 adds tabs / flip cards /
   carousel, which need behaviour in course-nav.js. Body text is markdown-lite
   (**bold** _italic_, blank line = new paragraph), same as the prose fields. */
export type CalloutVariant = "info" | "warn" | "tip";

export type ContentBlock =
  | { type: "accordion"; items: { title: string; body: string }[] }
  | { type: "reveal"; items: { prompt: string; body: string }[] }
  | { type: "callout"; variant: CalloutVariant; title: string; body: string }
  | { type: "timeline"; steps: { label: string; body: string }[] }
  | { type: "quote"; text: string; attribution: string };

export type ContentBlockType = ContentBlock["type"];

/* Default shape for a freshly added block of each type. */
export function emptyBlock(type: ContentBlockType): ContentBlock {
  switch (type) {
    case "accordion":
      return { type, items: [{ title: "", body: "" }] };
    case "reveal":
      return { type, items: [{ prompt: "", body: "" }] };
    case "callout":
      return { type, variant: "info", title: "", body: "" };
    case "timeline":
      return { type, steps: [{ label: "", body: "" }] };
    case "quote":
      return { type, text: "", attribution: "" };
  }
}

export type TopicDraft = {
  slug: string;
  title: string;
  kind: TopicKind;
  minutes: number;
  description: string;
  /* "" | "New" | "Updated" | "Law changed" — surfaces an accent pill */
  updated: string;
  standfirst: string;
  /* §1 — multi-paragraph text (blank line = new paragraph; **bold** _italic_) */
  scenario: string;
  /* §2 — multi-paragraph text */
  rule: string;
  /* §2 optional callout box with an ordered list */
  ruleBoxLabel: string;
  ruleBoxItems: string[];
  /* image placeholders — files land in images/ at upload time */
  media: TopicMedia[];
  /* §3 — optional; omit by leaving heading empty */
  whatChanged: WhatChanged | null;
  /* §4 */
  tryIt: {
    question: string;
    options: TryItOption[];
    answer: string;
  };
  /* §5 — bullet list */
  remember: string[];
  /* Interactive section — ordered, repeatable rich elements (optional;
     absent on drafts created before this field, so read with `?? []`). */
  blocks: ContentBlock[];
};

export type ModuleDraft = {
  id: string;
  title: string;
  description: string;
  topics: TopicDraft[];
};

export type CourseDraft = {
  id: string;
  createdAt: string;
  updatedAt: string;
  /* namespaces learner progress in localStorage — must be unique per course */
  courseId: string;
  courseTitle: string;
  courseSubtitle: string;
  courseBlurb: string;
  /* practice area label shown in the breadcrumb, e.g. "Court Skills" */
  courseArea: string;
  topic: TopicFamily;
  chromeMode: "bar" | "rail";
  homeLinkUrl: string;
  modules: ModuleDraft[];
};

export type DraftSummary = {
  id: string;
  courseTitle: string;
  topicCount: number;
  totalMinutes: number;
  updatedAt: string;
};

export type TemplateInfo = {
  available: boolean;
  dir: string;
  files: { name: string; sizeBytes: number; modifiedAt: string }[];
};

export function emptyTopic(slug: string, title: string): TopicDraft {
  return {
    slug,
    title,
    kind: "Concept",
    minutes: 3,
    description: "",
    updated: "",
    standfirst: "",
    scenario: "",
    rule: "",
    ruleBoxLabel: "",
    ruleBoxItems: [],
    media: [],
    whatChanged: null,
    tryIt: {
      question: "",
      options: [
        { text: "", correct: false },
        { text: "", correct: true },
        { text: "", correct: false },
      ],
      answer: "",
    },
    remember: [],
    blocks: [],
  };
}
