import type { CurriculumColumn, CurriculumMap, CurriculumNote } from "@/types/domain";

/* The starter curriculum map, digitized from the team's planning wall
   (mirrors platform-wiki/curriculum-map.html). Served when Supabase has no
   saved row yet; written to the DB on first Save so content lives in one place.
   Deterministic ids keep drag/edit stable before anything is persisted. */

let seq = 0;
function t(text: string, tag?: string): CurriculumNote {
  return { id: `seed-${++seq}`, text, level: "topic", ...(tag ? { tag } : {}) };
}
function s(text: string): CurriculumNote {
  return { id: `seed-${++seq}`, text, level: "sub" };
}
function col(id: string, title: string, notes: CurriculumNote[]): CurriculumColumn {
  return { id, title, notes };
}

const legalSkills: CurriculumColumn[] = [
  col("foundations", "Foundations", [
    t("Case Lifecycle"),
    t("History of Legal Aid"),
    t("Trauma-Informed Practice"),
    t("Cultural Humility"),
    t("Structural Competence"),
    t("Systems Thinking"),
    t("Working with Interpreters & Translators"),
    t("Working with Interdisciplinary Teams (ethics, strategy, etc.)"),
  ]),
  col("ethics", "Ethics", [
    t("MA Rules of Prof. Conduct"),
    s("Competence / Diligence"),
    s("Confidentiality & A-C Privilege"),
    s("Conflicts of Interest"),
    s("Scope of Rep & Client-Directed Decisions"),
    s("Candor to Tribunal"),
    s("Duties to Third Parties"),
    s("Supervising Paralegals, Law Students, Non-Legal Staff"),
    s("Withdrawal & Termination of Rep"),
    s("LSC Restrictions"),
    t("AI & Legal Aid"),
  ]),
  col("pre-engagement", "Pre-Engagement Prep", [t("Referral & Intake"), t("Conflict Checks")]),
  col("legal-writing", "Legal Writing", [
    t("Legal Writing Basics"),
    s("Audience"),
    s("Active vs Passive Voice"),
    s("Tone"),
    s("Point of View"),
    s("Plain Language vs Legalese"),
    s("Concise Sentences"),
    s("Limit Nominalizations"),
    s("Remove Unnecessary Words"),
    t("Types of Legal Writing"),
    s("Emails & Texts"),
    s("Demand Letters"),
    s("Memos"),
    s("Briefs & Motions"),
    s("Contracts & Transactional Documents"),
    s("Training & Know Your Rights Material"),
    s("Client Communications"),
    t("Legal Writing Prep"),
    t("Organization & Structure"),
    t("Clusters"),
    t("The Existing Process"),
    t("Legal Writing + AI"),
  ]),
  col("legal-research", "Legal Research", [
    t("Legal Research Planning"),
    t("Primary & Secondary Sources"),
    t("Research Strategy"),
    t("Legal Databases"),
    t("Public Records & Open-Source Docs"),
    t("Identifying Claims"),
    t("Identifying Defenses"),
    t("Identifying Damages"),
    t("Mapping Evidence & Elements"),
    t("Procedure & Logistics"),
  ]),
  col("pre-trial", "Pre-Trial / Advocacy Skills", [
    t("Initial Client Interviews", "unit intro"),
    s("Trauma-Informed Interviewing"),
    s("Working with Translators & Interpreters"),
    s("Prep for Initial Client Interview"),
    s("Building Client Rapport"),
    s("Establishing A-C Relationship"),
    s("Eliciting Client Narrative"),
    s("Open vs Closed Questions"),
    s("Identifying Key Facts"),
    s("Issue Spotting"),
    s("Threshold Legal Issues"),
    s("Closing the Interview"),
    s("Documenting the Interview"),
    t("Informal Fact Investigation"),
    s("Planning for Informal Fact Investigation"),
    s("Record Releases"),
    s("Witness Interviews"),
    s("Physical Evidence"),
    s("Public Records & Open-Source Research"),
    s("Expert Consultation"),
    t("Case Evaluation"),
    t("Client Counseling"),
    t("Case Strategy"),
    t("Case Theory"),
    t("Affirmative Litigation Planning"),
  ]),
  col("trial-skills", "Trial Skills / Advocacy", [
    t("Litigation Planning"),
    t("Pleadings"),
    t("Discovery"),
    t("Motions"),
    t("Pre-Trial Conference"),
    t("Jury Selection"),
    t("Exhibits"),
    t("Opening Statements"),
    t("Direct Exams"),
    t("Cross Exams"),
    t("Witnesses & Experts", "tentative"),
    t("Objections"),
    t("Closing Statements"),
    t("Oral Argument / Best Practice", "tentative"),
  ]),
  col("post-trial", "Post-Trial Skills", [
    t("Verdicts"),
    t("Post-Trial Motions"),
    t("Preserving Issues for Appeal"),
  ]),
  col("appellate", "Appellate Practice", [
    t("Preserving Issues for Appeal"),
    t("Appellate Strategy"),
    t("Briefing", "tentative"),
    t("Oral Argument"),
    t("Rehearing / Rehearing en Banc"),
    t("Certiorari"),
  ]),
  col("adr", "ADR", [t("Negotiation"), t("Arbitration"), t("Settlement")]),
  col("legislative", "Legislative Advocacy", [
    t("Preparing for Legislative Advocacy", "tentative"),
    t("Legislative & Budget Process", "tentative"),
    t("Administrative Advocacy", "tentative"),
    t("Lobbying Strategies", "tentative"),
  ]),
  col("community", "Community / Movement Lawyering", [
    t("Planning for Community / Movement Lawyering", "tentative"),
    t("Building Community Partnerships", "tentative"),
    t("Accountability & Ethics", "tentative"),
    t("Key Concepts", "tentative"),
  ]),
];

/* Substantive Law mirrors Legal Skills: each practice area is a column of
   topic/sub-topic notes. The areas are seeded as empty columns — the team fills
   in topics as each area gets developed. */
const substantiveAreas = [
  "Housing Law",
  "Family Law",
  "Immigration Law",
  "Education Law",
  "Employment Law",
  "Public Benefits Law",
  "Elder Law",
  "Health Law",
  "Consumer Protection Law",
  "Children's Law",
];

function areaSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const substantiveLaw: CurriculumColumn[] = substantiveAreas.map((name) =>
  col(areaSlug(name), name, []),
);

export const mockCurriculumMap: CurriculumMap = {
  branches: [
    { id: "legal-skills", title: "Legal Skills", type: "columns", columns: legalSkills },
    { id: "substantive-law", title: "Substantive Law", type: "columns", columns: substantiveLaw },
  ],
};
