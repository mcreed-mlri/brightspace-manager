import { CourseInventory } from "@/components/courses/course-inventory";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { listCourseOfferings } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const result = await listCourseOfferings();

  return (
    <>
      <PageHeader
        eyebrow="Monitor · Inventory"
        title="Course Inventory"
        description="Searchable inventory of Brightspace course offerings. Massachusetts is the first jurisdiction in scope."
      />
      {result.source === "mock" ? <MockDataBanner /> : null}
      <CourseInventory courses={result.data} />
    </>
  );
}
