"use client";

import { TabPresence } from "./TabPresence";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import type { PresenceSnapshot } from "@/types/presence";
import type { ThemeMode } from "@/types/state";

export function Header({
  presence,
  theme,
  onThemeChange,
  canUndo,
  onUndo,
}: {
  presence: PresenceSnapshot;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  canUndo: boolean;
  onUndo: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-accent text-white shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 20 20 20" />
              <polyline points="4 20 4 4" />
              <polyline points="8 15 12 11 16 15 20 9" />
            </svg>
          </span>
          <div className="flex flex-col gap-1">
            <div className="font-display text-base font-semibold leading-tight text-ink">EMI Workspace</div>
            <div className="text-[11px] leading-tight text-muted">Loan calculator · synced across tabs</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TabPresence presence={presence} />
          <Button size="sm" variant="ghost" onClick={onUndo} disabled={!canUndo} title="Undo last change (Ctrl/Cmd+Z)">
            Undo
          </Button>
          <ThemeToggle theme={theme} onChange={onThemeChange} />
        </div>
      </div>
    </header>
  );
}
