/** Upper bound of the merged (one-column) nav band. 1511 keeps every 13" MacBook
 *  on one column — 13.3" Air/Pro default to 1440pt, 13.6" M2/M3 Air to 1470pt, so
 *  1440 would miss the 13.6" — and hands the two-column rail to 14" MBP (1512pt)
 *  and wider. Must stay in sync with the media queries in
 *  apps/docs/src/css/custom.css and
 *  packages/docs-ui/src/shared/theme/DocRoot/Layout/styles.module.css. */
export const SIDEBAR_MERGE_MAX = 1511;

/** The left sidebar's merged state, which the topbar tabs now follow: below this
 *  width the tabs no longer fit beside the search box and would slide under it,
 *  so both sides fold at the same moment. `docs-nav-compact` is the same state
 *  reached by *effective* width when the AI panel eats into the viewport. */
export function isNavMerged(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth <= SIDEBAR_MERGE_MAX ||
    document.body.classList.contains('docs-nav-compact')
  );
}
