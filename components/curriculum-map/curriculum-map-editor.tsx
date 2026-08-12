"use client";

import { useCallback, useRef, useState } from "react";
import type {
  CurriculumBranch,
  CurriculumColumn,
  CurriculumMap,
  CurriculumNote,
  CurriculumTile,
} from "@/types/domain";
import styles from "./curriculum-map.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

type DragItem =
  | { kind: "note"; branchId: string; columnId: string; noteId: string }
  | { kind: "column"; branchId: string; columnId: string }
  | { kind: "tile"; branchId: string; tileId: string };

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function topicCount(col: CurriculumColumn): number {
  return col.notes.filter((n) => n.level === "topic").length;
}

/* Uncontrolled contentEditable: text is set once from `value` and committed on
   blur, so the caret never jumps while typing (no re-render per keystroke). */
function EditableText({
  value,
  onCommit,
  className,
}: {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
}) {
  return (
    <span
      className={className}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(event) => {
        const next = (event.currentTarget.textContent ?? "").trim();
        /* Never commit an empty card: restore the prior text and bail. */
        if (!next) {
          event.currentTarget.textContent = value;
          return;
        }
        if (next !== value) onCommit(next);
      }}
    >
      {value}
    </span>
  );
}

export function CurriculumMapEditor({ initial }: { initial: CurriculumMap }) {
  const [map, setMap] = useState<CurriculumMap>(() => clone(initial));
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [openCols, setOpenCols] = useState<Record<string, boolean>>({});
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const drag = useRef<DragItem | null>(null);
  /* Baseline the board reverts to on Cancel/Done. Starts at the server snapshot
     and advances to the current map after each successful save, so Done never
     rolls back work that has already been persisted. */
  const baseline = useRef<CurriculumMap>(clone(initial));

  const mutate = useCallback((fn: (draft: CurriculumMap) => void) => {
    setMap((prev) => {
      const next = clone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
    setSave("idle");
  }, []);

  function columnsBranch(draft: CurriculumMap, branchId: string): CurriculumColumn[] | null {
    const branch = draft.branches.find((b) => b.id === branchId);
    return branch && branch.type === "columns" ? branch.columns : null;
  }

  /* ---- note edits ---- */
  function setNoteText(branchId: string, columnId: string, noteId: string, text: string) {
    mutate((draft) => {
      const note = columnsBranch(draft, branchId)
        ?.find((c) => c.id === columnId)
        ?.notes.find((n) => n.id === noteId);
      if (note) note.text = text;
    });
  }
  function toggleLevel(branchId: string, columnId: string, noteId: string) {
    mutate((draft) => {
      const note = columnsBranch(draft, branchId)
        ?.find((c) => c.id === columnId)
        ?.notes.find((n) => n.id === noteId);
      if (note) note.level = note.level === "sub" ? "topic" : "sub";
    });
  }
  function toggleTag(branchId: string, columnId: string, noteId: string) {
    mutate((draft) => {
      const note = columnsBranch(draft, branchId)
        ?.find((c) => c.id === columnId)
        ?.notes.find((n) => n.id === noteId);
      if (note) note.tag = note.tag ? undefined : "tentative";
    });
  }
  function setNoteComment(branchId: string, columnId: string, noteId: string, text: string) {
    mutate((draft) => {
      const note = columnsBranch(draft, branchId)
        ?.find((c) => c.id === columnId)
        ?.notes.find((n) => n.id === noteId);
      if (note) note.comment = text ? text : undefined;
    });
  }
  function deleteNote(branchId: string, columnId: string, noteId: string) {
    mutate((draft) => {
      const col = columnsBranch(draft, branchId)?.find((c) => c.id === columnId);
      if (col) col.notes = col.notes.filter((n) => n.id !== noteId);
    });
  }
  function addNote(branchId: string, columnId: string) {
    mutate((draft) => {
      const col = columnsBranch(draft, branchId)?.find((c) => c.id === columnId);
      if (col) col.notes.push({ id: uid("note"), text: "New topic", level: "topic" });
    });
  }
  /* Sub-notes only attach to a topic: insert right after the topic and any
     sub-notes already beneath it, so the group stays contiguous. */
  function addSubNote(branchId: string, columnId: string, topicId: string) {
    mutate((draft) => {
      const col = columnsBranch(draft, branchId)?.find((c) => c.id === columnId);
      if (!col) return;
      const idx = col.notes.findIndex((n) => n.id === topicId);
      if (idx < 0 || col.notes[idx].level !== "topic") return;
      let insertAt = idx + 1;
      while (insertAt < col.notes.length && col.notes[insertAt].level === "sub") insertAt++;
      col.notes.splice(insertAt, 0, { id: uid("note"), text: "New sub-topic", level: "sub" });
    });
  }

  /* ---- column edits ---- */
  function setColumnTitle(branchId: string, columnId: string, title: string) {
    mutate((draft) => {
      const col = columnsBranch(draft, branchId)?.find((c) => c.id === columnId);
      if (col) col.title = title;
    });
  }
  function deleteColumn(branchId: string, columnId: string) {
    mutate((draft) => {
      const branch = draft.branches.find((b) => b.id === branchId);
      if (branch && branch.type === "columns") {
        branch.columns = branch.columns.filter((c) => c.id !== columnId);
      }
    });
  }
  function addColumn(branchId: string) {
    mutate((draft) => {
      const branch = draft.branches.find((b) => b.id === branchId);
      if (branch && branch.type === "columns") {
        branch.columns.push({ id: uid("col"), title: "New column", notes: [] });
      }
    });
  }

  /* ---- tile edits ---- */
  function setTileText(branchId: string, tileId: string, text: string) {
    mutate((draft) => {
      const branch = draft.branches.find((b) => b.id === branchId);
      if (branch && branch.type === "grid") {
        const tile = branch.tiles.find((tl) => tl.id === tileId);
        if (tile) tile.text = text;
      }
    });
  }
  function deleteTile(branchId: string, tileId: string) {
    mutate((draft) => {
      const branch = draft.branches.find((b) => b.id === branchId);
      if (branch && branch.type === "grid") {
        branch.tiles = branch.tiles.filter((tl) => tl.id !== tileId);
      }
    });
  }
  function addTile(branchId: string) {
    mutate((draft) => {
      const branch = draft.branches.find((b) => b.id === branchId);
      if (branch && branch.type === "grid") {
        branch.tiles.push({ id: uid("tile"), text: "New area" });
      }
    });
  }

  /* ---- drag & drop ---- */
  function onDragStart(item: DragItem) {
    drag.current = item;
  }
  function onDragEnd() {
    drag.current = null;
    setDropTarget(null);
  }

  function dropNote(branchId: string, columnId: string, beforeNoteId: string | null) {
    const src = drag.current;
    if (!src || src.kind !== "note" || src.branchId !== branchId) return;
    mutate((draft) => {
      const cols = columnsBranch(draft, branchId);
      if (!cols) return;
      const srcCol = cols.find((c) => c.id === src.columnId);
      const dstCol = cols.find((c) => c.id === columnId);
      if (!srcCol || !dstCol) return;
      const i = srcCol.notes.findIndex((n) => n.id === src.noteId);
      if (i < 0) return;
      const [note] = srcCol.notes.splice(i, 1);
      let j = dstCol.notes.length;
      if (beforeNoteId) {
        const k = dstCol.notes.findIndex((n) => n.id === beforeNoteId);
        if (k >= 0) j = k;
      }
      dstCol.notes.splice(j, 0, note);
    });
  }

  function dropColumn(branchId: string, beforeColumnId: string | null) {
    const src = drag.current;
    if (!src || src.kind !== "column" || src.branchId !== branchId) return;
    mutate((draft) => {
      const branch = draft.branches.find((b) => b.id === branchId);
      if (!branch || branch.type !== "columns") return;
      const i = branch.columns.findIndex((c) => c.id === src.columnId);
      if (i < 0) return;
      const [col] = branch.columns.splice(i, 1);
      let j = branch.columns.length;
      if (beforeColumnId) {
        const k = branch.columns.findIndex((c) => c.id === beforeColumnId);
        if (k >= 0) j = k;
      }
      branch.columns.splice(j, 0, col);
    });
  }

  function dropTile(branchId: string, beforeTileId: string | null) {
    const src = drag.current;
    if (!src || src.kind !== "tile" || src.branchId !== branchId) return;
    mutate((draft) => {
      const branch = draft.branches.find((b) => b.id === branchId);
      if (!branch || branch.type !== "grid") return;
      const i = branch.tiles.findIndex((tl) => tl.id === src.tileId);
      if (i < 0) return;
      const [tile] = branch.tiles.splice(i, 1);
      let j = branch.tiles.length;
      if (beforeTileId) {
        const k = branch.tiles.findIndex((tl) => tl.id === beforeTileId);
        if (k >= 0) j = k;
      }
      branch.tiles.splice(j, 0, tile);
    });
  }

  /* ---- view state ---- */
  function toggleColumn(columnId: string) {
    setOpenCols((prev) => ({ ...prev, [columnId]: !prev[columnId] }));
  }
  function setBranchOpen(branch: Extract<CurriculumBranch, { type: "columns" }>, open: boolean) {
    setOpenCols((prev) => {
      const next = { ...prev };
      branch.columns.forEach((c) => {
        next[c.id] = open;
      });
      return next;
    });
  }

  /* ---- save / cancel ---- */
  async function handleSave() {
    setSave("saving");
    setError(null);
    try {
      const res = await fetch("/api/curriculum-map/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message?: string } };
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message ?? "Save failed.");
      }
      baseline.current = clone(map);
      setSave("saved");
      setDirty(false);
    } catch (err) {
      setSave("error");
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setMap(clone(baseline.current));
    setDirty(false);
    setSave("idle");
    setError(null);
    setEditing(false);
  }

  const saveLabel =
    save === "saving"
      ? "Saving…"
      : dirty
        ? "Save changes"
        : save === "saved"
          ? "Saved"
          : "No changes";

  return (
    <div className={`${styles.board} fade-up`}>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        {!editing ? (
          <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
            Edit map
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={save === "saving" || !dirty}
            >
              {saveLabel}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Done
            </button>
            {dirty ? (
              <span className="text-[12.5px] text-ink-soft">Unsaved changes</span>
            ) : save === "saved" ? (
              <span className="text-[12.5px] text-status-ok-ink">All changes saved</span>
            ) : null}
          </>
        )}
        {error ? <span className="text-[12.5px] text-status-error-ink">{error}</span> : null}
      </div>

      {/* Legend */}
      <ul className={styles.legend}>
        <li>
          <span className={`${styles.swatch} ${styles.swBlue}`} aria-hidden />
          Skill area
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swOrange}`} aria-hidden />
          Topic
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swTeal}`} aria-hidden />
          Sub-topic
        </li>
      </ul>

      {map.branches.map((branch) =>
        branch.type === "columns" ? (
          <section key={branch.id} className={styles.branch}>
            <div className={styles.toolbar}>
              <span className={styles.branchTag}>{branch.title}</span>
              <span className={styles.toolSpacer} />
              {editing ? (
                <button
                  type="button"
                  className={styles.toolBtn}
                  onClick={() => addColumn(branch.id)}
                >
                  + Column
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={() => setBranchOpen(branch, true)}
                  >
                    Expand all
                  </button>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={() => setBranchOpen(branch, false)}
                  >
                    Collapse all
                  </button>
                </>
              )}
            </div>

            <div className={styles.wall}>
              {branch.columns.map((col) => {
                const open = editing || openCols[col.id];
                const headDropId = `col-${col.id}`;
                return (
                  <div
                    key={col.id}
                    className={styles.col}
                    onDragOver={(e) => {
                      if (editing && drag.current?.kind === "column") {
                        e.preventDefault();
                        setDropTarget(headDropId);
                      }
                    }}
                    onDrop={(e) => {
                      if (editing && drag.current?.kind === "column") {
                        e.preventDefault();
                        dropColumn(branch.id, col.id);
                        onDragEnd();
                      }
                    }}
                  >
                    <div
                      className={`${styles.colHead} ${
                        editing ? styles.draggable : ""
                      } ${dropTarget === headDropId ? styles.colDrop : ""}`}
                      draggable={editing}
                      onDragStart={() =>
                        onDragStart({ kind: "column", branchId: branch.id, columnId: col.id })
                      }
                      onDragEnd={onDragEnd}
                      onClick={() => {
                        if (!editing) toggleColumn(col.id);
                      }}
                      role={editing ? undefined : "button"}
                      tabIndex={editing ? undefined : 0}
                      onKeyDown={(e) => {
                        if (!editing && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          toggleColumn(col.id);
                        }
                      }}
                    >
                      {editing ? (
                        <input
                          className={styles.colTitleInput}
                          value={col.title}
                          onChange={(e) => setColumnTitle(branch.id, col.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Column title"
                        />
                      ) : (
                        <span className={styles.colHeadText}>
                          {col.title}
                          <span className={styles.colCount}>{topicCount(col)} topics</span>
                        </span>
                      )}
                      {editing ? (
                        <span className={styles.noteCtrls}>
                          <button
                            type="button"
                            className={`${styles.ctrlBtn} ${styles.ctrlDanger}`}
                            title="Delete column"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteColumn(branch.id, col.id);
                            }}
                          >
                            &times;
                          </button>
                        </span>
                      ) : (
                        <span className={`${styles.caret} ${open ? styles.caretOpen : ""}`}>
                          &#9656;
                        </span>
                      )}
                    </div>

                    {open ? (
                      <ul
                        className={styles.notes}
                        onDragOver={(e) => {
                          if (editing && drag.current?.kind === "note") e.preventDefault();
                        }}
                        onDrop={(e) => {
                          if (editing && drag.current?.kind === "note") {
                            e.preventDefault();
                            dropNote(branch.id, col.id, null);
                            onDragEnd();
                          }
                        }}
                      >
                        {col.notes.map((note) => (
                          <NoteRow
                            key={note.id}
                            note={note}
                            editing={editing}
                            dropActive={dropTarget === `note-${note.id}`}
                            onDragStartNote={() =>
                              onDragStart({
                                kind: "note",
                                branchId: branch.id,
                                columnId: col.id,
                                noteId: note.id,
                              })
                            }
                            onDragOverNote={(e) => {
                              if (editing && drag.current?.kind === "note") {
                                e.preventDefault();
                                setDropTarget(`note-${note.id}`);
                              }
                            }}
                            onDropNote={(e) => {
                              if (editing && drag.current?.kind === "note") {
                                e.preventDefault();
                                e.stopPropagation();
                                dropNote(branch.id, col.id, note.id);
                                onDragEnd();
                              }
                            }}
                            onDragEnd={onDragEnd}
                            onCommitText={(text) => setNoteText(branch.id, col.id, note.id, text)}
                            onToggleLevel={() => toggleLevel(branch.id, col.id, note.id)}
                            onToggleTag={() => toggleTag(branch.id, col.id, note.id)}
                            onAddSub={() => addSubNote(branch.id, col.id, note.id)}
                            onCommitComment={(text) =>
                              setNoteComment(branch.id, col.id, note.id, text)
                            }
                            onDelete={() => deleteNote(branch.id, col.id, note.id)}
                          />
                        ))}
                        {editing ? (
                          <li>
                            <button
                              type="button"
                              className={styles.addBtn}
                              onClick={() => addNote(branch.id, col.id)}
                            >
                              + Add note
                            </button>
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section key={branch.id} className={styles.branch}>
            <div className={styles.toolbar}>
              <span className={styles.branchTag}>{branch.title}</span>
              <span className={styles.toolSpacer} />
              {editing ? (
                <button type="button" className={styles.toolBtn} onClick={() => addTile(branch.id)}>
                  + Area
                </button>
              ) : null}
            </div>
            <div className={styles.grid}>
              {branch.tiles.map((tile) => (
                <TileRow
                  key={tile.id}
                  tile={tile}
                  editing={editing}
                  dropActive={dropTarget === `tile-${tile.id}`}
                  onDragStartTile={() =>
                    onDragStart({ kind: "tile", branchId: branch.id, tileId: tile.id })
                  }
                  onDragOverTile={(e) => {
                    if (editing && drag.current?.kind === "tile") {
                      e.preventDefault();
                      setDropTarget(`tile-${tile.id}`);
                    }
                  }}
                  onDropTile={(e) => {
                    if (editing && drag.current?.kind === "tile") {
                      e.preventDefault();
                      dropTile(branch.id, tile.id);
                      onDragEnd();
                    }
                  }}
                  onDragEnd={onDragEnd}
                  onCommitText={(text) => setTileText(branch.id, tile.id, text)}
                  onDelete={() => deleteTile(branch.id, tile.id)}
                />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}

function NoteRow({
  note,
  editing,
  dropActive,
  onDragStartNote,
  onDragOverNote,
  onDropNote,
  onDragEnd,
  onCommitText,
  onToggleLevel,
  onToggleTag,
  onAddSub,
  onCommitComment,
  onDelete,
}: {
  note: CurriculumNote;
  editing: boolean;
  dropActive: boolean;
  onDragStartNote: () => void;
  onDragOverNote: (e: React.DragEvent) => void;
  onDropNote: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onCommitText: (text: string) => void;
  onToggleLevel: () => void;
  onToggleTag: () => void;
  onAddSub: () => void;
  onCommitComment: (text: string) => void;
  onDelete: () => void;
}) {
  const [editingComment, setEditingComment] = useState(false);

  return (
    <li
      className={`${styles.noteRow} ${dropActive ? styles.dropBefore : ""}`}
      onDragOver={onDragOverNote}
      onDrop={onDropNote}
    >
      <div className={styles.noteMain}>
        <div
          className={`${styles.note} ${note.level === "sub" ? styles.noteSub : ""} ${
            editing ? styles.draggable : ""
          }`}
          draggable={editing}
          onDragStart={onDragStartNote}
          onDragEnd={onDragEnd}
        >
          {editing ? (
            <EditableText value={note.text} onCommit={onCommitText} className={styles.editable} />
          ) : (
            note.text
          )}
          {note.tag ? <span className={styles.tag}>{note.tag}</span> : null}
          {note.comment ? (
            <span
              className={styles.commentDot}
              title={note.comment}
              aria-label={`Personal note: ${note.comment}`}
            />
          ) : null}
        </div>
        {editing ? (
          <span className={styles.noteCtrls}>
            <button
              type="button"
              className={styles.ctrlBtn}
              title={note.level === "sub" ? "Make topic" : "Make sub-topic"}
              onClick={onToggleLevel}
            >
              {note.level === "sub" ? "↑" : "↓"}
            </button>
            {note.level === "topic" ? (
              <button
                type="button"
                className={styles.ctrlBtn}
                title="Add sub-note under this topic"
                onClick={onAddSub}
              >
                ↳
              </button>
            ) : null}
            <button
              type="button"
              className={`${styles.ctrlBtn} ${note.tag ? styles.ctrlOn : ""}`}
              title="Toggle tentative"
              onClick={onToggleTag}
            >
              ?
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${note.comment ? styles.ctrlOn : ""}`}
              title={note.comment ? "Edit personal note" : "Add personal note"}
              onClick={() => setEditingComment((v) => !v)}
            >
              ✎
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${styles.ctrlDanger}`}
              title="Delete note"
              onClick={onDelete}
            >
              &times;
            </button>
          </span>
        ) : null}
      </div>
      {editing && editingComment ? (
        <textarea
          className={styles.commentBox}
          defaultValue={note.comment ?? ""}
          placeholder="Personal note — hidden on the card, shown on hover.”"
          rows={2}
          autoFocus
          onBlur={(e) => {
            const next = e.currentTarget.value.trim();
            if (next !== (note.comment ?? "")) onCommitComment(next);
            setEditingComment(false);
          }}
        />
      ) : null}
    </li>
  );
}

function TileRow({
  tile,
  editing,
  dropActive,
  onDragStartTile,
  onDragOverTile,
  onDropTile,
  onDragEnd,
  onCommitText,
  onDelete,
}: {
  tile: CurriculumTile;
  editing: boolean;
  dropActive: boolean;
  onDragStartTile: () => void;
  onDragOverTile: (e: React.DragEvent) => void;
  onDropTile: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onCommitText: (text: string) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`${styles.tileRow} ${dropActive ? styles.dropBefore : ""}`}
      onDragOver={onDragOverTile}
      onDrop={onDropTile}
    >
      <div
        className={`${styles.tile} ${editing ? styles.draggable : ""}`}
        draggable={editing}
        onDragStart={onDragStartTile}
        onDragEnd={onDragEnd}
      >
        {editing ? (
          <EditableText value={tile.text} onCommit={onCommitText} className={styles.editable} />
        ) : (
          tile.text
        )}
      </div>
      {editing ? (
        <span className={styles.noteCtrls}>
          <button
            type="button"
            className={`${styles.ctrlBtn} ${styles.ctrlDanger}`}
            title="Delete area"
            onClick={onDelete}
          >
            &times;
          </button>
        </span>
      ) : null}
    </div>
  );
}
