import type { LearningItemRow } from "@/types/domain";

/* Mock learning_items rows mirroring lib/fixtures/courses.ts, with deliberate
   drift so the sync engine has real cases to flag:
     · 6707 has NO row            → missing from Supabase (broken)
     · 6699 row has no BS course  → orphan
     · 6726 title differs from BS → metadata mismatch
     · 6721 synced 40 days ago    → stale cache */

const BASE = "https://mlri.brightspace.com";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function row(
  n: number,
  orgUnitId: number,
  title: string,
  practiceArea: string | null,
  syncedDaysAgo: number,
): LearningItemRow {
  return {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    provider: "brightspace",
    provider_course_id: String(orgUnitId),
    provider_module_id: null,
    item_type: "course",
    title,
    description: null,
    practice_area: practiceArea,
    level: null,
    duration_label: null,
    brightspace_url: `${BASE}/d2l/home/${orgUnitId}`,
    metadata: {},
    synced_at: daysAgo(syncedDaysAgo),
    created_at: daysAgo(90),
    updated_at: daysAgo(syncedDaysAgo),
  };
}

export const mockLearningItems: LearningItemRow[] = [
  row(1, 6703, "Eviction Defense: The First 48 Hours", "Housing", 0.2),
  row(2, 6712, "Summary Process: Answer and Discovery", "Housing", 1),
  row(3, 6718, "SNAP Benefits: Eligibility and Appeals", "Benefits", 3),
  row(4, 6721, "Emergency Assistance Shelter Advocacy", "Benefits", 40),
  // Title drifted from the Brightspace name ("…: Practice Basics").
  row(5, 6726, "209A Protective Orders: The Basics", "Family", 5),
  row(6, 6731, "Debt Collection Defense in District Court", "Consumer", 6),
  row(7, 6735, "Welcome to LACE", "Foundations", 2),
  row(8, 6739, "Trauma-Informed Client Interviewing", null, 8),
  row(9, 6741, "Unemployment Insurance Hearings (2024)", "Benefits", 120),
  row(10, 6744, "Legal Writing Archive", "Legal Skills", 200),
  row(11, 6748, "Housing Conditions: Code Enforcement Clinic", "Housing", 0.5),
  // Orphan: org unit 6699 no longer exists in Brightspace.
  row(12, 6699, "Fair Hearing Prep (Retired Pilot)", "Benefits", 300),
];
