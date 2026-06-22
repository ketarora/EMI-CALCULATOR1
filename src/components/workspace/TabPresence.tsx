import { Badge } from "@/components/ui/Badge";
import type { PresenceSnapshot } from "@/types/presence";

export function TabPresence({ presence }: { presence: PresenceSnapshot }) {
  const label = presence.tabId ? `Tab ${String(presence.tabIndex).padStart(2, "0")}` : "Connecting…";

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
        <span className="text-xs font-medium text-ink">{label}</span>
        {presence.isLeader && <Badge tone="leader">Leader</Badge>}
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-positive" />
        </span>
        <span className="text-xs font-medium text-ink">
          {presence.activeTabCount} tab{presence.activeTabCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
