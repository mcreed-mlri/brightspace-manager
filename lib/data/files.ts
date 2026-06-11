import "server-only";

import { mockResult } from "@/lib/data/envelope";
import { mockFileTree } from "@/lib/fixtures/file-tree";
import type { DataResult, FileNode } from "@/types/domain";

export async function getManageFilesTree(orgUnitId: number): Promise<DataResult<FileNode>> {
  /* LIVE (later milestone): Brightspace Manage Files / content TOC read via
     lePath(`/${orgUnitId}/content/toc`) — requires content:toc:read scope.
     Mock tree models the LACE course package convention. */
  void orgUnitId;
  return mockResult(mockFileTree);
}
