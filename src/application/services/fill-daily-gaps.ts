import type { DailyBucket } from '../../domain/entities/daily-bucket';
import { emptyTokens } from '../../domain/value-objects/tokens';
import { dayKey } from '../../domain/value-objects/date-range';

/**
 * Returns a contiguous list of daily buckets between the first and last day
 * present in `daily` (inclusive). Missing days are filled with zero buckets
 * so a timeline chart never has implicit gaps.
 *
 * Assumes `daily` is sorted ascending by `day`. Returns the input as-is when
 * it has 0 or 1 entries (nothing to fill). Iterates by adding one day at a
 * time on a `Date` anchored at noon to dodge DST corners.
 */
export function fillDailyGaps(
  daily: ReadonlyArray<DailyBucket>,
): ReadonlyArray<DailyBucket> {
  if (daily.length <= 1) return daily;

  const byDay = new Map<string, DailyBucket>();
  for (const d of daily) byDay.set(d.day, d);

  const first = daily[0]!.day;
  const last = daily[daily.length - 1]!.day;
  const start = new Date(first + 'T12:00:00');
  const end = new Date(last + 'T12:00:00');

  const out: DailyBucket[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const key = dayKey(cursor);
    const existing = byDay.get(key);
    out.push(
      existing ?? {
        day: key,
        tokens: emptyTokens(),
        cost: 0,
        messages: 0,
        sessions: 0,
        projects: 0,
      },
    );
  }
  return out;
}
