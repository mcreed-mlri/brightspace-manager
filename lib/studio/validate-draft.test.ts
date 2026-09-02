import { describe, expect, it } from "vitest";

import { validateDraftId } from "@/lib/studio/paths";
import { validateCourseDraft } from "@/lib/studio/validate-draft";
import { emptyTopic, type CourseDraft } from "@/types/studio";

function validDraft(): CourseDraft {
  return {
    id: "eviction-defense",
    createdAt: "2026-09-02T12:00:00.000Z",
    updatedAt: "2026-09-02T12:00:00.000Z",
    courseId: "eviction-defense",
    courseTitle: "Eviction Defense",
    courseSubtitle: "",
    courseBlurb: "",
    courseArea: "Housing",
    topic: "foundations",
    chromeMode: "bar",
    homeLinkUrl: "https://example.com/",
    publish: {
      orgUnitId: null,
      orgUnitCode: "",
      baseHost: "mlri.brightspace.com",
      folderPath: "",
    },
    modules: [
      {
        id: "module-1",
        title: "Module 1",
        description: "",
        topics: [
          {
            ...emptyTopic("topic-1", "Topic 1"),
            media: [
              {
                filename: "notice.png",
                alt: "Notice",
                caption: "",
                placement: "scenario",
              },
            ],
            blocks: [
              {
                type: "callout",
                variant: "info",
                title: "Note",
                body: "Body",
              },
            ],
          },
        ],
      },
    ],
  };
}

describe("validateDraftId", () => {
  it("accepts generated slug ids and rejects path-like input", () => {
    expect(() => validateDraftId("eviction-defense-101")).not.toThrow();
    expect(() => validateDraftId("../secrets")).toThrow("Invalid draft id.");
    expect(() => validateDraftId("bad/id")).toThrow("Invalid draft id.");
  });
});

describe("validateCourseDraft", () => {
  it("accepts a complete CourseDraft payload", () => {
    const draft = validDraft();

    expect(validateCourseDraft(draft)).toEqual({ ok: true, draft });
  });

  it("rejects malformed top-level fields", () => {
    const draft = { ...validDraft(), courseTitle: 42 };

    expect(validateCourseDraft(draft)).toMatchObject({
      ok: false,
      message: "Invalid course draft payload: courseTitle must be a string.",
    });
  });

  it("rejects malformed nested topic content", () => {
    const draft = validDraft();
    draft.modules[0].topics[0].tryIt.options[0].correct = "yes" as unknown as boolean;

    expect(validateCourseDraft(draft)).toMatchObject({
      ok: false,
      message:
        "Invalid course draft payload: modules[0].topics[0].tryIt.options[0].correct must be a boolean.",
    });
  });

  it("rejects unsupported content block variants", () => {
    const draft = validDraft();
    draft.modules[0].topics[0].blocks = [{ type: "tabs" } as never];

    expect(validateCourseDraft(draft)).toMatchObject({
      ok: false,
      message:
        "Invalid course draft payload: modules[0].topics[0].blocks[0].type is not supported.",
    });
  });
});
