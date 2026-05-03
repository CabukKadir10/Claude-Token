import { describe, it, expect } from 'vitest';
import { DEFAULT_PRICING, clonePricing } from './pricing';
import { MODEL_TIERS } from './model-tier';

describe('DEFAULT_PRICING', () => {
  it('has a row for every model tier', () => {
    for (const tier of MODEL_TIERS) {
      expect(DEFAULT_PRICING[tier]).toBeDefined();
    }
  });

  it('has non-negative numbers everywhere', () => {
    for (const tier of MODEL_TIERS) {
      const row = DEFAULT_PRICING[tier];
      expect(row.in).toBeGreaterThanOrEqual(0);
      expect(row.out).toBeGreaterThanOrEqual(0);
      expect(row.cr).toBeGreaterThanOrEqual(0);
      expect(row.cw5m).toBeGreaterThanOrEqual(0);
      expect(row.cw1h).toBeGreaterThanOrEqual(0);
      expect(row.label.length).toBeGreaterThan(0);
    }
  });

  it('keeps Opus output ≥ input ≥ cache-read invariant', () => {
    for (const tier of MODEL_TIERS) {
      const row = DEFAULT_PRICING[tier];
      expect(row.out).toBeGreaterThanOrEqual(row.in);
      expect(row.in).toBeGreaterThanOrEqual(row.cr);
    }
  });
});

describe('clonePricing', () => {
  it('returns a deep copy', () => {
    const c = clonePricing();
    expect(c).toEqual(DEFAULT_PRICING);
    expect(c).not.toBe(DEFAULT_PRICING);
    expect(c['opus-4-7']).not.toBe(DEFAULT_PRICING['opus-4-7']);
  });

  it('the clone is mutable even though the source is frozen', () => {
    const c = clonePricing() as Record<string, { in: number }>;
    c['opus-4-7']!.in = 99;
    expect(c['opus-4-7']!.in).toBe(99);
    expect(DEFAULT_PRICING['opus-4-7'].in).toBe(5);
  });
});
