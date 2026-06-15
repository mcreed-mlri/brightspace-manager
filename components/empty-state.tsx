import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="editorial-card flex flex-col items-center px-6 py-16 text-center">
      {icon ? (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-tint)] text-accent">
          {icon}
        </div>
      ) : null}
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
      {children ? (
        <div className="mt-2.5 max-w-md text-sm leading-relaxed text-ink-muted">{children}</div>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
