"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useWorkspace } from "@/context/WorkspaceProvider";
import { createHistorySnapshot } from "@/context/workspaceReducer";
import { useUndoShortcut } from "@/hooks/useUndoShortcut";
import { useUrlState } from "@/hooks/useUrlState";
import { useAmortizationSchedule, useLoanTotals, useSensitivityGrid } from "@/hooks/useDerivedFinance";
import { summarizePrepaymentImpactFromSchedules } from "@/lib/finance/prepayment";
import { buildScenario, buildStarterScenarioPair, nextScenarioLabel } from "@/lib/scenarios";
import { createId } from "@/lib/sync/ids";

import { Header } from "@/components/workspace/Header";
import { ThemeEffect } from "@/components/workspace/ThemeEffect";
import { CompareModeIcon, PrepaymentModeIcon, SingleModeIcon } from "@/components/workspace/ModeIcons";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { InputPanel } from "@/components/calculator/InputPanel";
import { SummaryCards } from "@/components/calculator/SummaryCards";
import { SensitivityGrid } from "@/components/calculator/SensitivityGrid";
import { AmortizationSection } from "@/components/amortization/AmortizationSection";
import { ComparisonMode } from "@/components/comparison/ComparisonMode";
import { PrepaymentPlanner } from "@/components/prepayment/PrepaymentPlanner";

import type { HistorySnapshot, PrepaymentEntry, WorkspaceMode } from "@/types/state";

const MODE_OPTIONS: { value: WorkspaceMode; label: string; icon: ReactNode }[] = [
  { value: "single", label: "Single", icon: <SingleModeIcon /> },
  { value: "compare", label: "Compare", icon: <CompareModeIcon /> },
  { value: "prepayment", label: "Prepayment", icon: <PrepaymentModeIcon /> },
];

const EMPTY_PREPAYMENTS: PrepaymentEntry[] = [];

export function WorkspaceShell() {
  const { state, dispatch, presence, canUndo, ready } = useWorkspace();
  const [localMode, setLocalMode] = useState<WorkspaceMode>(state.ui.mode);
  const pendingHistoryRef = useRef<HistorySnapshot | null>(null);

  useUrlState(state.calculator, dispatch, ready);
  useUndoShortcut(dispatch, canUndo);

  const totals = useLoanTotals(state.calculator);
  const sensitivityGrid = useSensitivityGrid(state.calculator);
  const baseSchedule = useAmortizationSchedule(state.calculator, EMPTY_PREPAYMENTS);
  const prepaymentSchedule = useAmortizationSchedule(state.calculator, state.prepayment.entries);
  const prepaymentImpact = useMemo(
    () => summarizePrepaymentImpactFromSchedules(baseSchedule, prepaymentSchedule),
    [baseSchedule, prepaymentSchedule]
  );

  function beginBatchedEdit() {
    pendingHistoryRef.current ??= createHistorySnapshot(state);
  }

  function commitBatchedEdit() {
    if (!pendingHistoryRef.current) return;
    dispatch({ type: "PUSH_HISTORY", payload: pendingHistoryRef.current });
    pendingHistoryRef.current = null;
  }

  function handleCalculatorChange(field: "amount" | "rate" | "tenure", value: number) {
    if (field === "amount") dispatch({ type: "PREVIEW_AMOUNT", payload: value });
    if (field === "rate") dispatch({ type: "PREVIEW_RATE", payload: value });
    if (field === "tenure") dispatch({ type: "PREVIEW_TENURE", payload: value });
  }

  // Id generation happens here, at the dispatch call site — never inside
  // the reducer. The action that gets broadcast already carries the
  // fully-formed entity, so every tab that applies it ends up with the
  // exact same id, not a fresh random one of its own. See the comment
  // at the top of workspaceReducer.ts for why that distinction matters.
  function handleSetMode(mode: WorkspaceMode) {
    setLocalMode(mode);
    if (mode === "compare" && state.comparison.scenarios.length === 0) {
      const [first, second] = buildStarterScenarioPair(state.calculator, createId);
      dispatch({ type: "ADD_SCENARIO", payload: first });
      dispatch({ type: "ADD_SCENARIO", payload: second });
    }
  }

  function handleAddScenario() {
    const scenario = buildScenario(createId(), nextScenarioLabel(state.comparison.scenarios), state.calculator);
    dispatch({ type: "ADD_SCENARIO", payload: scenario });
  }

  function handleAddPrepayment(month: number, amount: number) {
    dispatch({ type: "ADD_PREPAYMENT", payload: { id: createId(), month, amount } });
  }

  return (
    <div className="min-h-screen bg-bg">
      <ThemeEffect theme={state.ui.theme} />
      <Header
        presence={presence}
        theme={state.ui.theme}
        onThemeChange={(theme) => dispatch({ type: "SWITCH_THEME", payload: theme })}
        canUndo={canUndo}
        onUndo={() => dispatch({ type: "UNDO" })}
      />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        <div className="flex justify-center sm:justify-start">
          <SegmentedControl
            ariaLabel="Workspace mode"
            value={localMode}
            onChange={handleSetMode}
            options={MODE_OPTIONS}
            variant="workspace"
          />
        </div>

        {localMode === "single" && (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
              <InputPanel
                inputs={state.calculator}
                onChange={handleCalculatorChange}
                onCommitStart={beginBatchedEdit}
                onCommitEnd={commitBatchedEdit}
              />
              <div className="space-y-5">
                <SummaryCards totals={totals} principal={state.calculator.amount} />
                <SensitivityGrid grid={sensitivityGrid} />
              </div>
            </div>
            <AmortizationSection
              schedule={baseSchedule}
              amount={state.calculator.amount}
              rate={state.calculator.rate}
              tenure={state.calculator.tenure}
            />
          </>
        )}

        {localMode === "compare" && (
          <ComparisonMode
            scenarios={state.comparison.scenarios}
            onAdd={handleAddScenario}
            onRemove={(id) => dispatch({ type: "REMOVE_SCENARIO", payload: { id } })}
            onFieldChange={(id, field, value) => dispatch({ type: "PREVIEW_SCENARIO", payload: { id, field, value } })}
            onCommitStart={beginBatchedEdit}
            onCommitEnd={commitBatchedEdit}
          />
        )}

        {localMode === "prepayment" && (
          <>
            <PrepaymentPlanner
              entries={state.prepayment.entries}
              currentTenure={state.calculator.tenure}
              impact={prepaymentImpact}
              onAdd={handleAddPrepayment}
              onRemove={(id) => dispatch({ type: "REMOVE_PREPAYMENT", payload: { id } })}
              onClear={() => dispatch({ type: "CLEAR_PREPAYMENTS" })}
            />
            <AmortizationSection
              schedule={prepaymentSchedule}
              amount={state.calculator.amount}
              rate={state.calculator.rate}
              tenure={state.calculator.tenure}
              title="Adjusted Schedule"
              subtitle="Amortization reflecting your prepayments"
            />
          </>
        )}

        <p className="pb-4 text-center text-xs text-muted">
          Open this page in a second tab — inputs and theme stay in sync while each tab keeps its own view.
        </p>
      </main>
    </div>
  );
}
