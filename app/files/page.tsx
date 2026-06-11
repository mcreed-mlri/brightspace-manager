import { FileTree } from "@/components/files/file-tree";
import { MockDataBanner } from "@/components/mock-data-banner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getManageFilesTree } from "@/lib/data/files";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const result = await getManageFilesTree(6703);

  return (
    <>
      <PageHeader
        title="Manage Files"
        description="Read-only view of a course's Manage Files area — see where HTML pages, wrapper assets, and images live without entering the LMS."
        actions={<StatusBadge tone="info">Read-only preview</StatusBadge>}
      />
      {result.source === "mock" ? <MockDataBanner /> : null}

      <div className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-soft">
          Course
        </span>
        <span className="font-medium text-ink">Eviction Defense: The First 48 Hours</span>
        <span className="font-mono text-xs text-ink-soft">org unit 6703</span>
      </div>

      <FileTree root={result.data} />

      <p className="mt-4 text-xs text-ink-soft">
        File editing and content-link analysis (which files are referenced by Content topics) arrive
        with the Integrity Checker milestone.
      </p>
    </>
  );
}
