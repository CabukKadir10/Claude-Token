import { describe, it, expect } from 'vitest';
import { dayKey, dayKeyOf, isInRange, isUnbounded, UNBOUNDED_RANGE } from './date-range';

describe('dayKey', () => {
  it('formats local date as YYYY-MM-DD with zero padding', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dayKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('dayKeyOf', () => {
  it('returns null for null timestamp', () => {
    expect(dayKeyOf(null)).toBeNull();
  });

  it('returns null for non-finite timestamp', () => {
    expect(dayKeyOf(NaN)).toBeNull();
    expect(dayKeyOf(Infinity)).toBeNull();
  });

  it('returns the local day key for a timestamp', () => {
    const ts = new Date(2026, 3, 26, 14, 30).getTime();
    expect(dayKeyOf(ts)).toBe('2026-04-26');
  });
});

describe('isInRange', () => {
  it('matches everything for an unbounded range', () => {
    expect(isInRange('2026-04-26', UNBOUNDED_RANGE)).toBe(true);
    expect(isInRange(null, UNBOUNDED_RANGE)).toBe(true);
  });

  it('rejects null day for any bounded range', () => {
    expect(isInRange(null, { from: '2026-01-01', to: null })).toBe(false);
    expect(isInRange(null, { from: null, to: '2026-12-31' })).toBe(false);
  });

  it('respects inclusive lower bound', () => {
    const r = { from: '2026-04-26', to: null };
    expect(isInRange('2026-04-25', r)).toBe(false);
    expect(isInRange('2026-04-26', r)).toBe(true);
    expect(isInRange('2026-04-27', r)).toBe(true);
  });

  it('respects inclusive upper bound', () => {
    const r = { from: null, to: '2026-04-26' };
    expect(isInRange('2026-04-26', r)).toBe(true);
    expect(isInRange('2026-04-27', r)).toBe(false);
  });

  it('respects both bounds', () => {
    const r = { from: '2026-04-01', to: '2026-04-30' };
    expect(isInRange('2026-03-31', r)).toBe(false);
    expect(isInRange('2026-04-01', r)).toBe(true);
    expect(isInRange('2026-04-15', r)).toBe(true);
    expect(isInRange('2026-04-30', r)).toBe(true);
    expect(isInRange('2026-05-01', r)).toBe(false);
  });
});

describe('isUnbounded', () => {
  it('detects fully unbounded ranges', () => {
    expect(isUnbounded(UNBOUNDED_RANGE)).toBe(true);
    expect(isUnbounded({ from: '2026-01-01', to: null })).toBe(false);
    expect(isUnbounded({ from: null, to: '2026-12-31' })).toBe(false);
  });
});
