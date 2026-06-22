import { Card, CardHeader } from "@/components/ui/Card";
import { formatINR, formatPercent } from "@/lib/finance/format";
import type { LoanTotals } from "@/lib/finance/emi";

function MetricTile({ label, value, accentClass }: { label: string; value: string; accentClass?: string }) {
  return (
    <div className={`rounded-md border bg-raised p-4 ${accentClass ? "border-accent" : "border-line"}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 font-figures text-xl font-bold sm:text-2xl ${accentClass ?? "text-ink"}`}>{value}</div>
    </div>
  );
}

export function SummaryCards({ totals, principal }: { totals: LoanTotals; principal: number }) {
  return (
    <Card>
      <CardHeader title="Summary" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricTile label="Monthly EMI" value={formatINR(totals.emi)} accentClass="text-accent-strong" />
        <MetricTile label="Total Interest" value={formatINR(totals.totalInterest)} />
        <MetricTile label="Total Payable" value={formatINR(totals.totalPayable)} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span className="font-bold">Principal vs Interest</span>
          <span className="font-figures">
            {formatPercent(totals.principalSharePct)} / {formatPercent(totals.interestSharePct)}
          </span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-raised" role="img" aria-label={`Principal ${formatPercent(totals.principalSharePct)}, interest ${formatPercent(totals.interestSharePct)}`}>
          <div className="h-full bg-principal" style={{ width: `${totals.principalSharePct}%` }} />
          <div className="h-full bg-interest" style={{ width: `${totals.interestSharePct}%` }} />
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-principal" /> Principal <span className="font-bold text-ink">{formatINR(principal)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-interest" /> Interest <span className="font-bold text-ink">{formatINR(totals.totalInterest)}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
