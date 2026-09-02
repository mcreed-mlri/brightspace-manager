import { FilesBrowser } from "@/components/files/files-browser";
import { LiveDataRequiredPanel } from "@/components/live-data-required-panel";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listCourseOfferings } from "@/lib/data/courses";
import { getManageFilesTree } from "@/lib/data/files";
import { isMockDataDisabledError } from "@/lib/data/mode";

export const dynamic = "force-dynamic";

const DEFAULT_ORG_UNIT = 6703;

export default async function FilesPage() {
  let coursesResult: Awaited<ReturnType<typeof listCourseOfferings>>;
  let treeResult: Awaited<ReturnType<typeof getManageFilesTree>>;
  try {
    [coursesResult, treeResult] = await Promise.all([
      listCourseOfferings(),
      getManageFilesTree(DEFAULT_ORG_UNIT),
    ]);
  } catch (error) {
    if (!isMockDataDisabledError(error)) throw error;
    return (
      <>
        <PageHeader
          eyebrow="Infrastructure · Brightspace"
          title="Brightspace Files"
          description="Read-only view of a course's Manage Files area in Brightspace. See where HTML pages, wrapper assets, and images live without entering the LMS."
          actions={<StatusBadge tone="info">Read-only preview</StatusBadge>}
        />
        <LiveDataRequiredPanel message={error.message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Infrastructure · Brightspace"
        title="Brightspace Files"
        description="Read-only view of a course's Manage Files area in Brightspace. See where HTML pages, wrapper assets, and images live without entering the LMS."
        actions={<StatusBadge tone="info">Read-only preview</StatusBadge>}
      />
      {treeResult.source === "mock" ? <MockDataBanner /> : null}

      <FilesBrowser
        courses={coursesResult.data}
        initialOrgUnitId={DEFAULT_ORG_UNIT}
        initialTree={treeResult.data}
        initialSource={treeResult.source}
      />

      <p className="mt-4 text-xs text-ink-soft">
        File editing and content-link analysis (which files are referenced by Content topics) arrive
        with the Integrity Checker milestone.
      </p>
    </>
  );
}
