import type { Tokens } from '../value-objects/tokens';
import type { ModelTier } from '../value-objects/model-tier';
import type { Pricing } from '../value-objects/pricing';

/**
 * Compute USD cost of a token block under a given tier and pricing table.
 *
 * Pricing is stored as USD per 1M tokens, so we divide by 1e6 once per
 * component. The function is pure — same inputs always produce the same output.
 */
export function computeCost(tokens: Tokens, tier: ModelTier, pricing: Pricing): number {
  const p = pricing[tier];
  return (
    (tokens.input        / 1e6) * p.in +
    (tokens.output       / 1e6) * p.out +
    (tokens.cacheRead    / 1e6) * p.cr +
    (tokens.cacheWrite   / 1e6) * p.cw5m +
    (tokens.cacheWrite1h / 1e6) * p.cw1h
  );
}

/**
 * Per-component cost split. Useful for the "cost share" KPI card and the
 * model-breakdown table.
 */
export interface CostBreakdown {
  readonly input: number;
  readonly output: number;
  readonly cacheRead: number;
  readonly cacheWrite: number;
  readonly cacheWrite1h: number;
  readonly total: number;
}

export function computeCostBreakdown(
  tokens: Tokens,
  tier: ModelTier,
  pricing: Pricing,
): CostBreakdown {
  const p = pricing[tier];
  const input = (tokens.input / 1e6) * p.in;
  const output = (tokens.output / 1e6) * p.out;
  const cacheRead = (tokens.cacheRead / 1e6) * p.cr;
  const cacheWrite = (tokens.cacheWrite / 1e6) * p.cw5m;
  const cacheWrite1h = (tokens.cacheWrite1h / 1e6) * p.cw1h;
  return {
    input,
    output,
    cacheRead,
    cacheWrite,
    cacheWrite1h,
    total: input + output + cacheRead + cacheWrite + cacheWrite1h,
  };
}
