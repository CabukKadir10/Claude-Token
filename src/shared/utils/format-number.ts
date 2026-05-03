/**
 * Compact number formatter for chart labels and KPI cards.
 *   1234         → "1.2K"
 *   1_500_000    → "1.50M"
 *   2_000_000_000 → "2.00B"
 */
export function fmtCompact(n: number): string {
  if (!n) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(Math.round(n));
}

/**
 * Full-precision formatter using locale-aware thousand separators.
 * Defaults to en-US ("12,345"); call with 'tr-TR' for Turkish ("12.345").
 */
export function fmtFull(n: number, locale: string = 'en-US'): string {
  return Math.round(n || 0).toLocaleString(locale);
}

/**
 * Format a 0..1 ratio as a percentage with no decimals.
 *   0.234 → "23%"
 */
export function fmtPercent(ratio: number): string {
  return Math.round((ratio || 0) * 100) + '%';
}
