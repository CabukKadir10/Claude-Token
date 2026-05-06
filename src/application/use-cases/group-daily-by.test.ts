import { describe, expect, it } from 'vitest';
import { groupDailyBy } from './group-daily-by';
import type { DailyBucket } from '../../domain/entities/daily-bucket';

const day = (input: {
  day: string;
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
  cacheWrite1h?: number;
  cost: number;
  messages: number;
  sessions: number;
  projects: number;
}): DailyBucket => ({
  day: input.day,
  tokens: {
    input: input.input,
    output: input.output,
    cacheRead: input.cacheRead ?? 0,
    cacheWrite: input.cacheWrite ?? 0,
    cacheWrite1h: input.cacheWrite1h ?? 0,
  },
  cost: input.cost,
  messages: input.messages,
  sessions: input.sessions,
  projects: input.projects,
});

describe('groupDailyBy', () => {
  it('returns one row per day when period is day', () => {
    const rows = groupDailyBy({
      period: 'day',
      daily: [
        day({ day: '2026-05-01', input: 10, output: 1, cost: 0.1, messages: 1, sessions: 1, projects: 1 }),
        day({ day: '2026-05-02', input: 20, output: 2, cost: 0.2, messages: 2, sessions: 2, projects: 1 }),
      ],
    });

    expect(rows.map((r) => r.periodKey)).toEqual(['2026-05-01', '2026-05-02']);
    expect(rows[0]?.tokens.input).toBe(10);
    expect(rows[1]?.tokens.input).toBe(20);
  });

  it('groups by ISO week', () => {
    const rows = groupDailyBy({
      period: 'week',
      daily: [
        day({ day: '2026-05-04', input: 10, output: 1, cost: 0.1, messages: 1, sessions: 1, projects: 1 }),
        day({ day: '2026-05-06', input: 20, output: 2, cost: 0.2, messages: 2, sessions: 2, projects: 1 }),
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.periodKey).toBe('2026-W19');
    expect(rows[0]?.cost).toBeCloseTo(0.3);
    expect(rows[0]?.messages).toBe(3);
    expect(rows[0]?.sessions).toBe(3);
    expect(rows[0]?.projects).toBe(2);
    expect(rows[0]?.tokens).toMatchObject({ input: 30, output: 3 });
  });

  it('returns empty array for empty input', () => {
    expect(groupDailyBy({ period: 'month', daily: [] })).toEqual([]);
  });
});
