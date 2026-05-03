import type { Tokens } from '../value-objects/tokens';

/**
 * Aggregated stats for one hour-of-day (0..23, local time).
 * The `aggregate-events` use case always returns exactly 24 of these.
 */
export interface HourlyBucket {
  readonly hour: number;
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
}
