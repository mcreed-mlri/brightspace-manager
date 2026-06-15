"use client";

import { useEffect, type ReactNode } from "react";

/* Centered confirm modal for destructive actions. Mirrors Drawer's overlay
   conventions (fixed inset-0 z-50, bg-ink/20 backdrop, Escape to cancel,
   role="dialog" aria-modal) but pops in the center rather than sliding from
   the edge. Reusable wherever a "this can't be undone" gate is needed. */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "brand";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-status-error text-white hover:opacity-[0.9]"
      : "bg-brand-fill text-white hover:opacity-[0.88]";

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/20"
      />
      <div className="confirm-pop relative w-full max-w-[380px] rounded-[14px] border border-line bg-surface p-5 shadow-[var(--shadow-lg)]">
        <h2 className="text-[15.5px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
        <div className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{message}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[8px] border border-line bg-surface px-3.5 py-[7px] text-[13px] font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`rounded-[8px] border-none px-3.5 py-[7px] text-[13px] font-bold transition-opacity ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
