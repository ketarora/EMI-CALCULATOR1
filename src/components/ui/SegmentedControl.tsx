import type { ReactNode } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  variant = "default",
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  variant?: "default" | "workspace" | "table";
}) {
  const containerClasses = {
    default: "rounded-full border border-line bg-seg-bg p-1",
    workspace: "rounded-[32px] border border-line bg-surface shadow-ledger p-1",
    table: "rounded-xl border border-line bg-seg-bg p-1",
  }[variant];

  return (
    <div role="tablist" aria-label={ariaLabel} className={`inline-flex ${containerClasses}`}>
      {options.map((option) => {
        const active = option.value === value;
        const activeClasses = {
          default: "bg-seg-active text-ink shadow-ledger",
          workspace: "bg-[#453EDA] text-white",
          table: "bg-seg-active text-ink shadow-ledger",
        }[variant];

        const inactiveClasses = {
          default: "text-muted hover:text-ink",
          workspace: "text-muted hover:text-ink",
          table: "text-muted hover:text-ink",
        }[variant];
        
        const shapeClasses = {
          default: "rounded-full",
          workspace: "rounded-[28px]",
          table: "rounded-lg",
        }[variant];

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${shapeClasses} ${
              active ? activeClasses : inactiveClasses
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
