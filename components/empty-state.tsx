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
    <div className="editorial-card flex flex-col items-center px-6 py-14 text-center">
      {icon ? <div className="mb-3 text-ink-soft">{icon}</div> : null}
      <h2 className="text-[17px] font-bold text-ink">{title}</h2>
      {children ? <div className="mt-2 max-w-md text-sm text-ink-muted">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
