import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface shadow-ledger ${padded ? "pt-4 px-4 pb-4 sm:pt-4 sm:px-5 sm:pb-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="-mx-4 mb-4 flex items-start justify-between gap-3 border-b border-line px-4 pb-3 sm:-mx-5 sm:px-5">
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
