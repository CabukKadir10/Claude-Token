import { describe, it, expect } from 'vitest';
import { computeCost, computeCostBreakdown } from './compute-cost';
import { DEFAULT_PRICING } from '../value-objects/pricing';
import type { Tokens } from '../value-objects/tokens';

const make = (overrides: Partial<Tokens> = {}): Tokens => ({
  input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0,
  ...overrides,
});

const APPROX = (n: number) => expect.closeTo(n, 8);

describe('computeCost', () => {
  it('is zero for zero tokens', () => {
    expect(computeCost(make(), 'opus-4-7', DEFAULT_PRICING)).toBe(0);
  });

  it('uses Opus 4.7 pricing: 1M input + 1M output = $5 + $25 = $30', () => {
    const t = make({ input: 1_000_000, output: 1_000_000 });
    expect(computeCost(t, 'opus-4-7', DEFAULT_PRICING)).toBe(30);
  });

  it('uses Sonnet 4.6 pricing: 500k input + 100k output = $1.50 + $1.50 = $3', () => {
    const t = make({ input: 500_000, output: 100_000 });
    expect(computeCost(t, 'sonnet-4-6', DEFAULT_PRICING)).toBeCloseTo(3, 8);
  });

  it('charges cache writes at 5m vs 1h tiers separately', () => {
    const t = make({ cacheWrite: 1_000_000, cacheWrite1h: 1_000_000 });
    // Opus 4.7: 5m = $6.25/M, 1h = $10/M
    expect(computeCost(t, 'opus-4-7', DEFAULT_PRICING)).toBeCloseTo(16.25, 8);
  });

  it('falls back to default tier pricing for unknown models', () => {
    const t = make({ input: 1_000_000 });
    expect(computeCost(t, 'default', DEFAULT_PRICING)).toBe(3); // matches sonnet baseline
  });
});

describe('computeCostBreakdown', () => {
  it('splits cost across all components and totals correctly', () => {
    const t = make({
      input: 1_000_000,
      output: 500_000,
      cacheRead: 2_000_000,
      cacheWrite: 100_000,
      cacheWrite1h: 50_000,
    });
    const b = computeCostBreakdown(t, 'sonnet-4-6', DEFAULT_PRICING);
    APPROX(3);     // input: 1M * $3
    APPROX(7.5);   // output: 0.5M * $15
    APPROX(0.6);   // cacheRead: 2M * $0.30
    APPROX(0.375); // cacheWrite (5m): 0.1M * $3.75
    APPROX(0.3);   // cacheWrite1h: 0.05M * $6
    expect(b.input).toBeCloseTo(3, 8);
    expect(b.output).toBeCloseTo(7.5, 8);
    expect(b.cacheRead).toBeCloseTo(0.6, 8);
    expect(b.cacheWrite).toBeCloseTo(0.375, 8);
    expect(b.cacheWrite1h).toBeCloseTo(0.3, 8);
    expect(b.total).toBeCloseTo(3 + 7.5 + 0.6 + 0.375 + 0.3, 8);
  });

  it('total equals computeCost', () => {
    const t = make({ input: 12345, output: 67890, cacheRead: 11111, cacheWrite: 222, cacheWrite1h: 333 });
    expect(computeCostBreakdown(t, 'opus-4-7', DEFAULT_PRICING).total)
      .toBeCloseTo(computeCost(t, 'opus-4-7', DEFAULT_PRICING), 12);
  });
});
