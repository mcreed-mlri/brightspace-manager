"use client";

import { useEffect, type ReactNode } from "react";
import { IconClose } from "@/components/icons";

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(6,8,12,0.55)] backdrop-blur-[2px]"
      />
      <div className="drawer-panel absolute inset-y-0 right-0 flex w-full max-w-[452px] flex-col border-l border-line bg-surface shadow-[var(--shadow-drawer)]">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-[19px] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <IconClose size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
