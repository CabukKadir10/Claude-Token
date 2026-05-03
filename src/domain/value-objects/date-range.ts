/**
 * A closed date range using ISO date strings (YYYY-MM-DD).
 * Both ends are inclusive. `null` means "unbounded on this side".
 */
export interface DateRange {
  readonly from: string | null;
  readonly to: string | null;
}

export const UNBOUNDED_RANGE: DateRange = Object.freeze({ from: null, to: null });

/** Local-time YYYY-MM-DD key for the given Date. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Convenience: dayKey for a Unix-ms timestamp, or null. */
export function dayKeyOf(ts: number | null): string | null {
  if (ts === null || !Number.isFinite(ts)) return null;
  return dayKey(new Date(ts));
}

/**
 * `true` when the day falls inside the range (lexicographic comparison works
 * because YYYY-MM-DD is lexicographically ordered).
 *
 * - Unbounded range matches everything (including events with `day === null`).
 * - Bounded range never matches `day === null`.
 */
export function isInRange(day: string | null, range: DateRange): boolean {
  if (range.from === null && range.to === null) return true;
  if (day === null) return false;
  if (range.from !== null && day < range.from) return false;
  if (range.to !== null && day > range.to) return false;
  return true;
}

/** True if the range is unbounded on both sides. */
export function isUnbounded(range: DateRange): boolean {
  return range.from === null && range.to === null;
}
