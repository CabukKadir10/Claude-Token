/**
 * Strings used by `formatDateRel`. Letting the caller inject these keeps the
 * formatter pure and i18n-friendly — the presentation layer wires up the
 * active dictionary (TR/EN) at call time.
 */
export interface RelativeTimeLabels {
  readonly justNow: string;
  readonly minutesAgo: (n: number) => string;
  readonly hoursAgo: (n: number) => string;
  readonly daysAgo: (n: number) => string;
  /** Shown when the timestamp is `null` or invalid. */
  readonly unknown: string;
}

export const EN_RELATIVE: RelativeTimeLabels = {
  justNow: 'just now',
  minutesAgo: (n) => `${n}m ago`,
  hoursAgo: (n) => `${n}h ago`,
  daysAgo: (n) => `${n}d ago`,
  unknown: '–',
};

export interface FormatDateRelOptions {
  /** Override "now" for deterministic tests. Defaults to `Date.now()`. */
  readonly now?: number;
  readonly labels?: RelativeTimeLabels;
}

/**
 * Format a timestamp as a "k minutes ago" / "k hours ago" / "k days ago"
 * label. After 7 days, falls back to a YYYY-MM-DD date string.
 */
export function formatDateRel(ts: number | null, opts: FormatDateRelOptions = {}): string {
  const labels = opts.labels ?? EN_RELATIVE;
  if (ts === null || !Number.isFinite(ts)) return labels.unknown;
  const now = opts.now ?? Date.now();
  const diff = now - ts;
  if (diff < 60_000) return labels.justNow;
  if (diff < 3_600_000) return labels.minutesAgo(Math.floor(diff / 60_000));
  if (diff < 86_400_000) return labels.hoursAgo(Math.floor(diff / 3_600_000));
  if (diff < 7 * 86_400_000) return labels.daysAgo(Math.floor(diff / 86_400_000));
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Format a duration in milliseconds as a compact human string.
 *   45_000      → "45s"
 *   180_000     → "3m 0s"
 *   3_900_000   → "1h 5m"
 *   90_000_000  → "1d 1h"
 */
export function formatDuration(ms: number): string {
  const s = Math.floor(Math.max(0, ms) / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ' + (s % 60) + 's';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ' + (m % 60) + 'm';
  const d = Math.floor(h / 24);
  return d + 'd ' + (h % 24) + 'h';
}
