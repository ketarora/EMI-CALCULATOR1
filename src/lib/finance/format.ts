/**
 * Currency handling policy (deliberate, see PRD discussion):
 * we keep money as plain floating-point `number` internally — the
 * formulas are run over a small number of iterations (≤ 84 months,
 * ≤ 49 sensitivity cells), so float drift is negligible — and round
 * only at the boundary where a number is about to be displayed,
 * summed for a user-facing total, or exported. This avoids the far
 * larger bug surface of hand-rolled integer-paise arithmetic for a
 * formula that's defined in continuous compound-interest terms.
 */

/** Round to the nearest rupee for display/export. */
export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100 === 0 ? 0 : Math.round(value);
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCompactFormatter1dp = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const inrCompactFormatter2dp = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatINR(value: number): string {
  return inrFormatter.format(roundCurrency(value));
}

/** Compact form for axis labels / tight spaces. Lakhs and Crores always
 *  show two decimals (₹50.00L); thousands show none (₹10k) — this
 *  matches the reference design exactly rather than a single uniform
 *  precision rule. */
export function formatINRCompact(value: number): string {
  const v = roundCurrency(value);
  const abs = Math.abs(v);
  if (abs >= 1_00_00_000) return `₹${inrCompactFormatter2dp.format(v / 1_00_00_000)}Cr`;
  if (abs >= 1_00_000) return `₹${inrCompactFormatter2dp.format(v / 1_00_000)}L`;
  if (abs >= 1_000) return `₹${inrCompactFormatter1dp.format(v / 1_000)}k`;
  return `₹${inrCompactFormatter1dp.format(v)}`;
}

/** "1 mo", "7 yr", "4yr 6mo" — used anywhere a tenure value is shown as a
 *  label rather than an editable number (slider range labels, the
 *  sensitivity grid's row headers). */
export function formatTenureLabel(months: number): string {
  if (months < 12) return `${months} mo`;
  if (months % 12 === 0) return `${months / 12} yr`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return `${years}yr ${rest}mo`;
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
