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
  };
}
