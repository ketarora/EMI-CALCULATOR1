/** Small line icons for the Single / Compare / Prepayment switcher,
 *  hand-rolled to match ThemeToggle's existing icon style (no icon
 *  library dependency, full control over stroke weight/size). */

export function SingleModeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

export function CompareModeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="3" width="7" height="18" rx="1" />
    </svg>
  );
}

/**
 * The reference uses a generic "$" glyph here. This app deals
 * exclusively in INR, so the rupee sign is the more correct choice for
 * this specific build — a deliberate deviation from the reference image,
 * not an oversight.
 */
export function PrepaymentModeIcon() {
  return <span aria-hidden="true" className="text-[13px] font-semibold leading-none">₹</span>;
}
