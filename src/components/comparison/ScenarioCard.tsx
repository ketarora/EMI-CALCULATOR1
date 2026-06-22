"use client";

import { SliderField } from "@/components/calculator/SliderField";
import { Badge } from "@/components/ui/Badge";
import { LIMITS } from "@/types/state";
import { formatINR, formatINRCompact, formatTenureLabel } from "@/lib/finance/format";
import type { ScenarioResult } from "@/lib/finance/comparison";

export function ScenarioCard({
  scenario,
  onFieldChange,
  onCommitStart,
  onCommitEnd,
  onRemove,
  canRemove,
}: {
  scenario: ScenarioResult;
  onFieldChange: (field: "amount" | "rate" | "tenure", value: number) => void;
  onCommitStart: () => void;
  onCommitEnd: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div
      className={`relative rounded-lg border p-5 transition-colors ${
        scenario.isBest ? "border-positive bg-positive/5" : "border-line bg-surface"
      }`}
    >
      {scenario.isBest && (
        <div className="absolute -top-3 left-5">
          <Badge tone="positive">Best value</Badge>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink">{scenario.label}</h3>
        {canRemove && (
          <button
            onClick={onRemove}
            aria-label={`Remove ${scenario.label}`}
            className="flex h-6 w-6 items-center justify-center rounded-sm text-muted transition-colors hover:bg-raised hover:text-danger"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-5">
        <SliderField
          id={`${scenario.id}-amount`}
          label="Amount"
          unitPrefix="₹"
          value={scenario.amount}
          min={LIMITS.amount.min}
          max={LIMITS.amount.max}
          step={LIMITS.amount.step}
          minLabel={formatINRCompact(LIMITS.amount.min)}
          maxLabel={formatINRCompact(LIMITS.amount.max)}
          onChange={(value) => onFieldChange("amount", value)}
          onCommitStart={onCommitStart}
          onCommitEnd={onCommitEnd}
        />
        <SliderField
          id={`${scenario.id}-rate`}
          label="Rate"
          unitSuffix="%"
          value={scenario.rate}
          min={LIMITS.rate.min}
          max={LIMITS.rate.max}
          step={LIMITS.rate.step}
          minLabel={`${LIMITS.rate.min}%`}
          maxLabel={`${LIMITS.rate.max}%`}
          onChange={(value) => onFieldChange("rate", value)}
          onCommitStart={onCommitStart}
          onCommitEnd={onCommitEnd}
        />
        <SliderField
          id={`${scenario.id}-tenure`}
          label="Tenure"
          unitSuffix="mo"
          value={scenario.tenure}
          min={LIMITS.tenure.min}
          max={LIMITS.tenure.max}
          step={LIMITS.tenure.step}
          minLabel={formatTenureLabel(LIMITS.tenure.min)}
          maxLabel={formatTenureLabel(LIMITS.tenure.max)}
          onChange={(value) => onFieldChange("tenure", value)}
          onCommitStart={onCommitStart}
          onCommitEnd={onCommitEnd}
        />
      </div>

      <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Monthly EMI</dt>
          <dd className="font-figures font-semibold text-accent-strong">{formatINR(scenario.emi)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Total interest</dt>
          <dd className="font-figures text-ink">{formatINR(scenario.totalInterest)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Total payable</dt>
          <dd className={`font-figures font-semibold ${scenario.isBest ? "text-positive" : "text-ink"}`}>
            {formatINR(scenario.totalPayable)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
