import { CurriculumMapEditor } from "@/components/curriculum-map/curriculum-map-editor";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { getCurriculumMap } from "@/lib/data/curriculum-map";

/* Always re-fetch so a successful Save is visible after navigate-away / refresh.
   Other data pages set this; without it Next can statically cache the SSR result. */
export const dynamic = "force-dynamic";

/* Team-editable curriculum planning wall. Fetched server-side (live from
   Supabase when a row exists, else the bundled starter map); the client editor
   handles edit mode, drag-reorder, and Save. Sign-in is enforced by middleware
   and re-checked in the save route. */
export default async function CurriculumMapPage() {
  const result = await getCurriculumMap();

  return (
    <div className="fade-up min-w-0 max-w-[1200px] break-words">
      {result.source === "mock" ? <MockDataBanner /> : null}
      <PageHeader
        eyebrow="Author / Curriculum Map"
        title="Curriculum Map"
        description="The living map of how the LACE curriculum is organized. Click Edit map to rename, add, remove, or drag notes, then Save to share with the team."
      />
      <CurriculumMapEditor initial={result.data} />
    </div>
  );
}
