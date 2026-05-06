import { describe, expect, it } from 'vitest';
import { isoWeekKey } from './iso-week';

describe('isoWeekKey', () => {
  it('returns ISO week key for a regular date', () => {
    expect(isoWeekKey('2026-05-06')).toBe('2026-W19');
  });

  it('handles year boundaries by ISO week rules', () => {
    expect(isoWeekKey('2021-01-01')).toBe('2020-W53');
    expect(isoWeekKey('2021-01-04')).toBe('2021-W01');
  });

  it('throws for invalid day key format', () => {
    expect(() => isoWeekKey('2026/05/06')).toThrowError('Invalid day key: 2026/05/06');
  });
});
