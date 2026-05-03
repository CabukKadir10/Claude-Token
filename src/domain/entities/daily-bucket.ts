import type { Tokens } from '../value-objects/tokens';

/**
 * Aggregated stats for one local-time day (`YYYY-MM-DD`).
 * Built by the `aggregate-events` use case.
 */
export interface DailyBucket {
  readonly day: string;
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
  /** Distinct sessions seen on this day. */
  readonly sessions: number;
  /** Distinct projects seen on this day. */
  readonly projects: number;
}
