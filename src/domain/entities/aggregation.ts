import type { Tokens } from '../value-objects/tokens';
import type { CostBreakdown } from '../services/compute-cost';
import type { Project } from './project';
import type { Session } from './session';
import type { DailyBucket } from './daily-bucket';
import type { HourlyBucket } from './hourly-bucket';
import type { ModelBucket } from './model-bucket';

/**
 * Top-level totals across the active filter range. Independent of any view.
 */
export interface AggregationTotals {
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
  /** Distinct sessions in scope. */
  readonly sessions: number;
  /** Distinct projects in scope. */
  readonly projects: number;
  /** Cost split by token component. `total` equals `cost`. */
  readonly costByComponent: CostBreakdown;
}

/**
 * The full aggregation result returned by the `aggregate-events` use case.
 * Every view (Overview, Projects, Sessions, Timeline, By-date) renders some
 * slice of this structure — they never re-aggregate from raw events.
 */
export interface Aggregation {
  readonly totals: AggregationTotals;
  readonly projects: ReadonlyArray<Project>;
  readonly sessions: ReadonlyArray<Session>;
  readonly daily: ReadonlyArray<DailyBucket>;
  /** Always length 24, indexed by hour-of-day. */
  readonly hourly: ReadonlyArray<HourlyBucket>;
  readonly byModel: ReadonlyArray<ModelBucket>;
}
