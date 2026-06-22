import { Card, CardHeader } from "@/components/ui/Card";
import { formatINR, formatTenureLabel } from "@/lib/finance/format";
import type { SensitivityGrid as SensitivityGridData } from "@/lib/finance/sensitivity";

export function SensitivityGrid({ grid }: { grid: SensitivityGridData }) {
  return (
    <Card>
      <CardHeader title="Sensitivity Analysis" subtitle="EMI across rate × tenure — current values highlighted" />
      <div className="ledger-scroll overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 whitespace-nowrap bg-surface px-2 py-2 text-left text-xs font-medium text-muted">
                Tenure / Rate
              </th>
              {grid.rates.map((rate) => (
                <th
                  key={rate}
                  className={`px-2 py-2 text-right font-figures text-xs font-medium ${
                    rate === grid.currentRate ? "text-accent-strong font-semibold" : "text-muted"
                  }`}
                >
                  {rate.toFixed(1)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.rows.map((row, rowIndex) => {
              const tenure = grid.tenures[rowIndex] ?? 0;
              const isCurrentRow = tenure === grid.currentTenure;
              return (
                <tr key={tenure} className="border-t border-line">
                  <td
                    className={`sticky left-0 bg-surface px-2 py-2 text-left text-xs font-medium ${
                      isCurrentRow ? "text-accent-strong font-semibold" : "text-muted"
                    }`}
                  >
                    {formatTenureLabel(tenure)}
                  </td>
                  {row.map((cell) => (
                    <td
                      key={`${cell.rate}-${cell.tenure}`}
                      className={`px-2 py-2 text-right font-figures text-xs ${
                        cell.isCurrent ? "rounded-sm bg-accent font-semibold text-white" : "text-ink"
                      }`}
                    >
                      {formatINR(cell.emi)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
