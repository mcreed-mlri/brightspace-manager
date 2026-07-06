import type { CourseDraft, PublishSettings } from "@/types/studio";

/* Deploy-ready exports — pure helpers shared by the generator (server) and
   the builder UI (client), so no "server-only" import here.

   Brightspace serves files uploaded to Manage Files at a formulaic URL:
     https://{host}/content/enforced/{orgUnitId}-{orgUnitCode}/{file}?ou={orgUnitId}&d2l_body_type=3
   (verified against the deployed Welcome-to-LACE course, ou 6706). Knowing
   the org unit id + code up front lets the export pre-fill every topic URL —
   no post-upload editing of course-config.js. */

export const DEFAULT_BASE_HOST = "mlri.brightspace.com";

const CODE_PATTERN = /^[A-Za-z0-9._-]+$/;

export function emptyPublishSettings(): PublishSettings {
  return { orgUnitId: null, orgUnitCode: "", baseHost: DEFAULT_BASE_HOST, folderPath: "" };
}

/* True when a publish target is fully specified and well-formed. */
export function isPublishComplete(p: PublishSettings | undefined): boolean {
  return Boolean(
    p &&
    typeof p.orgUnitId === "number" &&
    Number.isInteger(p.orgUnitId) &&
    p.orgUnitId > 0 &&
    p.orgUnitCode.trim() &&
    CODE_PATTERN.test(p.orgUnitCode.trim()) &&
    p.baseHost.trim(),
  );
}

export function isDeployReady(draft: CourseDraft): boolean {
  return isPublishComplete(draft.publish);
}

/* The final Brightspace URL for one file in the package. */
export function lmsFileUrl(publish: PublishSettings, file: string): string {
  const host = publish.baseHost
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const folder = publish.folderPath.trim().replace(/^\/+|\/+$/g, "");
  const prefix = folder ? `${folder.split("/").map(encodeURIComponent).join("/")}/` : "";
  return (
    `https://${host}/content/enforced/${publish.orgUnitId}-${encodeURIComponent(publish.orgUnitCode.trim())}` +
    `/${prefix}${encodeURIComponent(file)}?ou=${publish.orgUnitId}&d2l_body_type=3`
  );
}

/* Plain-language problems with a PARTIALLY filled publish target. A draft
   with no publish settings at all is fine — that's a local-preview export. */
export function publishProblems(draft: CourseDraft): string[] {
  const p = draft.publish;
  if (!p) return [];
  const touched = p.orgUnitId !== null || p.orgUnitCode.trim() !== "" || p.folderPath.trim() !== "";
  if (!touched) return [];

  const problems: string[] = [];
  if (p.orgUnitId === null || !Number.isInteger(p.orgUnitId) || p.orgUnitId <= 0) {
    problems.push(
      "Publish settings: the Brightspace course id is missing — pick the course in Course details, or clear the publish settings to export a local preview.",
    );
  }
  if (!p.orgUnitCode.trim()) {
    problems.push(
      "Publish settings: the Brightspace course code is missing — find it under Course Admin → Course Offering Information.",
    );
  } else if (!CODE_PATTERN.test(p.orgUnitCode.trim())) {
    problems.push(
      "Publish settings: the course code can only contain letters, numbers, dots, dashes, and underscores.",
    );
  }
  if (!p.baseHost.trim()) {
    problems.push("Publish settings: the Brightspace address is missing.");
  }
  return problems;
}
