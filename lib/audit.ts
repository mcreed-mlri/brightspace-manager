import "server-only";

import { promises as fs } from "fs";
import path from "path";

import type { SyncAuditEntry } from "@/types/domain";

/* Append-only JSONL audit log for write actions (governance: every sync run
   is logged). Lives next to the app, gitignored. */

function auditFilePath() {
  return process.env.SYNC_AUDIT_FILE || path.join(process.cwd(), "sync-audit.jsonl");
}

export async function appendAuditEntry(entry: SyncAuditEntry): Promise<void> {
  try {
    await fs.appendFile(auditFilePath(), JSON.stringify(entry) + "\n", "utf8");
  } catch (error) {
    /* Auditing must never break the action itself, but make it loud. */
    console.error("[audit] failed to append sync audit entry:", error);
  }
}

export async function readRecentAuditEntries(limit = 5): Promise<SyncAuditEntry[]> {
  try {
    const raw = await fs.readFile(auditFilePath(), "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .reverse()
      .map((line) => JSON.parse(line) as SyncAuditEntry);
  } catch {
    return [];
  }
}
