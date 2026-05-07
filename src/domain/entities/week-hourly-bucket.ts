import type { Tokens } from '../value-objects/tokens';

/**
 * Aggregated stats for a single week-day + hour cell.
 * Identity: (`weekDay`, `hour`) tuple in a fixed 7x24 grid.
 *
 * Invariants:
 * - `weekDay` is Monday-first in range 0..6.
 * - `hour` is local-time hour in range 0..23.
 */
export interface WeekHourlyBucket {
  readonly weekDay: number;
  readonly hour: number;
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
}
