import { describe, it, expect } from 'vitest';
import { fmtCost, fmtCostCompact } from './format-cost';

describe('fmtCost', () => {
  it('zero shows two decimals', () => {
    expect(fmtCost(0)).toBe('$0.00');
  });

  it('tiny values use 5 decimals', () => {
    expect(fmtCost(0.00012)).toBe('$0.00012');
  });

  it('cents use 4 decimals', () => {
    expect(fmtCost(0.34)).toBe('$0.3400');
  });

  it('small dollars use 3 decimals', () => {
    expect(fmtCost(12.34)).toBe('$12.340');
  });

  it('larger amounts use 2 decimals', () => {
    expect(fmtCost(123.45)).toBe('$123.45');
  });

  it('thousands+ use thousands separator and no decimals', () => {
    expect(fmtCost(12345)).toBe('$12,345');
  });
});

describe('fmtCostCompact', () => {
  it('shows <$0.01 for sub-cent values', () => {
    expect(fmtCostCompact(0.005)).toBe('<$0.01');
  });

  it('uses k suffix for thousands', () => {
    expect(fmtCostCompact(1234)).toBe('$1.2k');
  });

  it('zero is "$0"', () => {
    expect(fmtCostCompact(0)).toBe('$0');
  });

  it('mid-range stays expanded', () => {
    expect(fmtCostCompact(12.34)).toBe('$12.3');
    expect(fmtCostCompact(123)).toBe('$123');
  });
});
