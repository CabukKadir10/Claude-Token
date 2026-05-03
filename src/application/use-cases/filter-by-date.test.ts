import { describe, it, expect } from 'vitest';
import { filterByDate } from './filter-by-date';
import { UNBOUNDED_RANGE } from '../../domain/value-objects/date-range';
import type { UsageEvent } from '../../domain/entities/usage-event';

const ev = (day: string | null): UsageEvent => ({
  ts: day ? Date.parse(`${day}T12:00:00Z`) : null,
  day,
  projectKey: '/p',
  projectName: 'p',
  sessionId: 's',
  model: null,
  tier: 'default',
  tokens: { input: 1, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 },
});

describe('filterByDate', () => {
  it('returns the same array reference for an unbounded range', () => {
    const events = [ev('2026-04-01')];
    expect(filterByDate(events, UNBOUNDED_RANGE)).toBe(events);
  });

  it('keeps events whose day is inside the range (inclusive)', () => {
    const events = [ev('2026-03-31'), ev('2026-04-01'), ev('2026-04-15'), ev('2026-04-30'), ev('2026-05-01')];
    const r = filterByDate(events, { from: '2026-04-01', to: '2026-04-30' });
    expect(r.map((e) => e.day)).toEqual(['2026-04-01', '2026-04-15', '2026-04-30']);
  });

  it('drops events with null day for any bounded range', () => {
    const events = [ev(null), ev('2026-04-15')];
    expect(filterByDate(events, { from: '2026-01-01', to: null }).map((e) => e.day))
      .toEqual(['2026-04-15']);
  });
});
