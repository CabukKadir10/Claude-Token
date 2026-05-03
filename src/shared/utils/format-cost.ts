/**
 * Cost formatter that picks a sensible precision based on the magnitude.
 * The bigger the number, the fewer significant decimals we need to show.
 *   $0       → "$0.00"
 *   $0.00012 → "$0.00012"
 *   $0.34    → "$0.3400"
 *   $12.34   → "$12.340"
 *   $123.45  → "$123.45"
 *   $12345   → "$12,345"
 */
export function fmtCost(n: number): string {
  const v = n || 0;
  if (v >= 1000) return '$' + Math.round(v).toLocaleString('en-US');
  if (v >= 100) return '$' + v.toFixed(2);
  if (v >= 1) return '$' + v.toFixed(3);
  if (v >= 0.01) return '$' + v.toFixed(4);
  if (v > 0) return '$' + v.toFixed(5);
  return '$0.00';
}

/**
 * Compact variant for tight UI (chips, KPI deltas).
 *   $1234 → "$1.2k"
 *   $0.001 → "<$0.01"
 */
export function fmtCostCompact(n: number): string {
  const v = n || 0;
  if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'k';
  if (v >= 100) return '$' + v.toFixed(0);
  if (v >= 10) return '$' + v.toFixed(1);
  if (v >= 1) return '$' + v.toFixed(2);
  if (v >= 0.01) return '$' + v.toFixed(3);
  if (v > 0) return '<$0.01';
  return '$0';
}
