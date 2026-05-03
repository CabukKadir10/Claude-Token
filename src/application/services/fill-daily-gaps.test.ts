import { describe, it, expect } from 'vitest';
import { fillDailyGaps } from './fill-daily-gaps';
import type { DailyBucket } from '../../domain/entities/daily-bucket';
import { emptyTokens } from '../../domain/value-objects/tokens';

function bucket(day: string, cost = 1, messages = 1): DailyBucket {
  return {
    day,
    tokens: { ...emptyTokens(), input: 100, output: 50 },
    cost,
    messages,
    sessions: 1,
    projects: 1,
  };
}

describe('fillDailyGaps', () => {
  it('returns the input unchanged when empty', () => {
    expect(fillDailyGaps([])).toEqual([]);
  });

  it('returns the input unchanged when only one day is present', () => {
    const input = [bucket('2026-04-26')];
    expect(fillDailyGaps(input)).toBe(input);
  });

  it('fills missing days between first and last with zero buckets', () => {
    const input = [bucket('2026-04-25', 5), bucket('2026-04-28', 7)];
    const out = fillDailyGaps(input);
    expect(out.map((d) => d.day)).toEqual([
      '2026-04-25',
      '2026-04-26',
      '2026-04-27',
      '2026-04-28',
    ]);
    expect(out[1]!.cost).toBe(0);
    expect(out[1]!.messages).toBe(0);
    expect(out[1]!.sessions).toBe(0);
    expect(out[2]!.cost).toBe(0);
    // Existing buckets are preserved by reference.
    expect(out[0]).toBe(input[0]);
    expect(out[3]).toBe(input[1]);
  });

  it('keeps consecutive days untouched', () => {
    const input = [bucket('2026-04-26'), bucket('2026-04-27'), bucket('2026-04-28')];
    const out = fillDailyGaps(input);
    expect(out).toHaveLength(3);
    expect(out[0]).toBe(input[0]);
    expect(out[1]).toBe(input[1]);
    expect(out[2]).toBe(input[2]);
  });

  it('crosses month boundaries correctly', () => {
    const input = [bucket('2026-01-31'), bucket('2026-02-02')];
    const out = fillDailyGaps(input);
    expect(out.map((d) => d.day)).toEqual(['2026-01-31', '2026-02-01', '2026-02-02']);
  });
});
