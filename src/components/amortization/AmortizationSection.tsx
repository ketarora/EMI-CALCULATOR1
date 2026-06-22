"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ScheduleTable } from "./ScheduleTable";
import { ScheduleChart } from "./ScheduleChart";
import { amortizationToCsv, downloadCsv } from "@/lib/export/csv";
import type { AmortizationResult } from "@/lib/finance/amortization";

type ViewMode = "table" | "chart";

export function AmortizationSection({
  schedule,
  amount,
  rate,
  tenure,
  title = "Amortization Schedule",
  subtitle = "Month-by-month principal & interest breakdown",
}: {
  schedule: AmortizationResult;
  amount: number;
  rate: number;
  tenure: number;
  title?: string;
  subtitle?: string;
}) {
  const [view, setView] = useState<ViewMode>("table");

  function handleExport() {
    const csv = amortizationToCsv(schedule.rows, { amount, rate, tenure });
    downloadCsv(`amortization-schedule-${amount}-${rate}pct-${tenure}mo.csv`, csv);
  }

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />

      {/* Toolbar: view toggle + break-even note on the left, export on the
       *  right — its own row below the header, matching the reference
       *  exactly rather than bundling these into the header's action slot. */}
      <div className="-mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 pb-4 sm:-mx-5 sm:px-5">
        <div className="flex items-center gap-3">
          <SegmentedControl
            ariaLabel="Schedule view"
            value={view}
            onChange={setView}
            options={[
              { value: "table", label: "Table" },
              { value: "chart", label: "Chart" },
            ]}
            variant="table"
          />
          {schedule.breakEvenMonth && (
            <span className="text-xs font-bold text-muted">
              Break-even at <span className="font-bold text-breakeven">month {schedule.breakEvenMonth}</span>
            </span>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Export CSV
        </Button>
      </div>

      {view === "table" ? (
        <ScheduleTable rows={schedule.rows} breakEvenMonth={schedule.breakEvenMonth} />
      ) : (
        <ScheduleChart rows={schedule.rows} />
      )}
    </Card>
  );
}
