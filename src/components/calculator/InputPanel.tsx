"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { SliderField } from "./SliderField";
import { LIMITS, type CalculatorInputs } from "@/types/state";
import { formatINRCompact, formatTenureLabel } from "@/lib/finance/format";

interface InputPanelProps {
  inputs: CalculatorInputs;
  onChange: (field: "amount" | "rate" | "tenure", value: number) => void;
  onCommitStart: () => void;
  onCommitEnd: () => void;
}

export function InputPanel({ inputs, onChange, onCommitStart, onCommitEnd }: InputPanelProps) {
  return (
    <Card>
      <CardHeader title="Loan Details" subtitle="Adjust and watch every tab update" />
      <div className="space-y-6">
        <SliderField
          id="loan-amount"
          label="Loan Amount"
          unitPrefix="₹"
          value={inputs.amount}
          min={LIMITS.amount.min}
          max={LIMITS.amount.max}
          step={LIMITS.amount.step}
          minLabel={formatINRCompact(LIMITS.amount.min)}
          maxLabel={formatINRCompact(LIMITS.amount.max)}
          onChange={(value) => onChange("amount", value)}
          onCommitStart={onCommitStart}
          onCommitEnd={onCommitEnd}
        />
        <SliderField
          id="interest-rate"
          label="Interest Rate (p.a.)"
          unitSuffix="%"
          value={inputs.rate}
          min={LIMITS.rate.min}
          max={LIMITS.rate.max}
          step={LIMITS.rate.step}
          minLabel={`${LIMITS.rate.min}%`}
          maxLabel={`${LIMITS.rate.max}%`}
          onChange={(value) => onChange("rate", value)}
          onCommitStart={onCommitStart}
          onCommitEnd={onCommitEnd}
        />
        <SliderField
          id="tenure"
          label="Tenure"
          unitSuffix="mo"
          value={inputs.tenure}
          min={LIMITS.tenure.min}
          max={LIMITS.tenure.max}
          step={LIMITS.tenure.step}
          minLabel={formatTenureLabel(LIMITS.tenure.min)}
          maxLabel={formatTenureLabel(LIMITS.tenure.max)}
          onChange={(value) => onChange("tenure", value)}
          onCommitStart={onCommitStart}
          onCommitEnd={onCommitEnd}
        />
      </div>
    </Card>
  );
}
