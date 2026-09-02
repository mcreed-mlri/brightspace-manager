import { CourseInventory } from "@/components/courses/course-inventory";
import { LiveDataRequiredPanel } from "@/components/live-data-required-panel";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { listCourseOfferings } from "@/lib/data/courses";
import { isMockDataDisabledError } from "@/lib/data/mode";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  let result: Awaited<ReturnType<typeof listCourseOfferings>>;
  try {
    result = await listCourseOfferings();
  } catch (error) {
    if (!isMockDataDisabledError(error)) throw error;
    return (
      <>
        <PageHeader
          eyebrow="Monitor · Inventory"
          title="Course Inventory"
          description="Searchable inventory of Brightspace course offerings. Massachusetts is the first jurisdiction in scope."
        />
        <LiveDataRequiredPanel message={error.message} />
      </>
    );
  }

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
