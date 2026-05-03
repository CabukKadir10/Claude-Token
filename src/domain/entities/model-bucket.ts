import type { Tokens } from '../value-objects/tokens';
import type { ModelTier } from '../value-objects/model-tier';

/**
 * Aggregated stats for one pricing tier across all events in scope.
 * Powers the "cost by model" view and the per-tier KPI rows.
 */
export interface ModelBucket {
  readonly tier: ModelTier;
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
  /** Distinct sessions that touched this tier. */
  readonly sessions: number;
  /** Distinct projects that touched this tier. */
  readonly projects: number;
}
