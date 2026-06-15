import { FilesBrowser } from "@/components/files/files-browser";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listCourseOfferings } from "@/lib/data/courses";
import { getManageFilesTree } from "@/lib/data/files";

export const dynamic = "force-dynamic";

const DEFAULT_ORG_UNIT = 6703;

export default async function FilesPage() {
  const [coursesResult, treeResult] = await Promise.all([
    listCourseOfferings(),
    getManageFilesTree(DEFAULT_ORG_UNIT),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Under the hood · Files"
        title="Manage Files"
        description="Read-only view of a course's Manage Files area — see where HTML pages, wrapper assets, and images live without entering the LMS."
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
