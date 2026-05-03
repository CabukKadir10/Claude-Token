import { describe, it, expect } from 'vitest';
import { fmtCompact, fmtFull, fmtPercent } from './format-number';

describe('fmtCompact', () => {
  it('formats 0 as "0"', () => {
    expect(fmtCompact(0)).toBe('0');
  });

  it('returns rounded integer for values under 1k', () => {
    expect(fmtCompact(5)).toBe('5');
    expect(fmtCompact(999)).toBe('999');
  });

  it('uses K suffix for thousands (one decimal)', () => {
    expect(fmtCompact(1234)).toBe('1.2K');
    expect(fmtCompact(12_345)).toBe('12.3K');
  });

  it('uses M suffix for millions (two decimals)', () => {
    expect(fmtCompact(1_500_000)).toBe('1.50M');
    expect(fmtCompact(12_345_678)).toBe('12.35M');
  });

  it('uses B suffix for billions', () => {
    expect(fmtCompact(2_000_000_000)).toBe('2.00B');
  });
});

describe('fmtFull', () => {
  it('uses en-US separators by default', () => {
    expect(fmtFull(12345)).toBe('12,345');
  });

  it('respects the locale parameter', () => {
    expect(fmtFull(12345, 'tr-TR')).toBe('12.345');
  });

  it('rounds to integer', () => {
    expect(fmtFull(12.7)).toBe('13');
  });
});

describe('fmtPercent', () => {
  it('rounds to whole percent', () => {
    expect(fmtPercent(0.234)).toBe('23%');
    expect(fmtPercent(0.5)).toBe('50%');
    expect(fmtPercent(0)).toBe('0%');
    expect(fmtPercent(1)).toBe('100%');
  });
});
