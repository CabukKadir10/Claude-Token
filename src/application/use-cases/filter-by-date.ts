import type { UsageEvent } from '../../domain/entities/usage-event';
import type { DateRange } from '../../domain/value-objects/date-range';
import { isInRange, isUnbounded } from '../../domain/value-objects/date-range';

/**
 * Drop events whose `day` falls outside the range. Events with `day === null`
 * pass through only when the range is fully unbounded.
 *
 * Returns the same array reference when the range is unbounded — callers can
 * use `===` to skip re-aggregation.
 */
export function filterByDate(
  events: ReadonlyArray<UsageEvent>,
  range: DateRange,
): ReadonlyArray<UsageEvent> {
  if (isUnbounded(range)) return events;
  return events.filter((e) => isInRange(e.day, range));
}
