"use client";

import { useState } from "react";
import { IconFile, IconFolder } from "@/components/icons";
import type { FileNode } from "@/types/domain";
import { formatBytes, formatRelative } from "@/components/courses/course-presentation";

function FileRow({ node, depth }: { node: FileNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const isFolder = node.kind === "folder";

  return (
    <>
      <div
        className="flex items-center gap-2.5 border-b border-line-soft px-4 py-2 last:border-b-0"
        style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
      >
        {isFolder ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 text-sm font-medium text-ink hover:text-brand"
            aria-expanded={open}
          >
            <IconFolder size={15} className="text-status-warn" />
            {node.name}
            <span className="font-mono text-[11px] text-ink-soft">{open ? "−" : "+"}</span>
          </button>
        ) : (
          <>
            <IconFile size={15} className="shrink-0 text-ink-soft" />
            <span className="min-w-0 truncate text-sm text-ink">{node.name}</span>
            <span className="ml-auto flex shrink-0 items-center gap-4 font-mono text-[11px] text-ink-soft">
              {node.sizeBytes != null ? <span>{formatBytes(node.sizeBytes)}</span> : null}
              {node.modifiedAt ? (
                <span title={node.modifiedAt}>{formatRelative(node.modifiedAt)}</span>
              ) : null}
            </span>
          </>
        )}
      </div>
      {isFolder && open
        ? node.children?.map((child) => <FileRow key={child.path} node={child} depth={depth + 1} />)
        : null}
    </>
  );
}

export function FileTree({ root }: { root: FileNode }) {
  return (
    <div className="editorial-card overflow-hidden">
      {root.children?.map((node) => <FileRow key={node.path} node={node} depth={0} />)}
    </div>
  );
}
