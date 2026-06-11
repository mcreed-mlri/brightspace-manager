/* Mock rows for the planned Supabase reference tables (jurisdictions,
   programs, tags). These tables don't exist in the live schema yet — the
   data browser shows them as mock previews of the intended shape. */

export const mockJurisdictions: Record<string, unknown>[] = [
  { id: 1, code: "MA", name: "Massachusetts", active: true, course_count: 12 },
  { id: 2, code: "CT", name: "Connecticut", active: false, course_count: 0 },
  { id: 3, code: "RI", name: "Rhode Island", active: false, course_count: 0 },
];

export const mockPrograms: Record<string, unknown>[] = [
  { id: 1, name: "Housing", practice_area: "housing", course_count: 3 },
  { id: 2, name: "Benefits", practice_area: "benefits", course_count: 3 },
  { id: 3, name: "Family", practice_area: "family", course_count: 1 },
  { id: 4, name: "Consumer", practice_area: "consumer", course_count: 1 },
  { id: 5, name: "Foundations", practice_area: "general_skills", course_count: 1 },
  { id: 6, name: "Legal Skills", practice_area: "general_skills", course_count: 1 },
];

export const mockTags: Record<string, unknown>[] = [
  { id: 1, name: "self-paced", usage_count: 12 },
  { id: 2, name: "court-forms", usage_count: 4 },
  { id: 3, name: "new-attorney", usage_count: 5 },
  { id: 4, name: "spanish-available", usage_count: 2 },
  { id: 5, name: "ce-credit", usage_count: 3 },
];
