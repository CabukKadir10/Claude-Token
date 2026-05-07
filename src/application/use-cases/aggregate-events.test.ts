import { describe, it, expect } from 'vitest';
import { aggregateEvents } from './aggregate-events';
import { DEFAULT_PRICING } from '../../domain/value-objects/pricing';
import type { UsageEvent } from '../../domain/entities/usage-event';
import type { ModelTier } from '../../domain/value-objects/model-tier';

const ev = (overrides: Partial<UsageEvent> & { tier?: ModelTier; ts?: number | null }): UsageEvent => ({
  ts: overrides.ts ?? null,
  day: overrides.ts != null ? new Date(overrides.ts).toISOString().slice(0, 10) : null,
  projectKey: '/p',
  projectName: 'p',
  sessionId: 's',
  model: 'claude-sonnet-4-6',
  tier: 'sonnet-4-6',
  tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 },
  ...overrides,
});

const at = (iso: string) => Date.parse(iso);

describe('aggregateEvents', () => {
  it('returns zeroed totals for an empty input', () => {
    const a = aggregateEvents({ events: [], pricing: DEFAULT_PRICING });
    expect(a.totals.cost).toBe(0);
    expect(a.totals.messages).toBe(0);
    expect(a.totals.sessions).toBe(0);
    expect(a.totals.projects).toBe(0);
    expect(a.projects).toHaveLength(0);
    expect(a.sessions).toHaveLength(0);
    expect(a.daily).toHaveLength(0);
    expect(a.byModel).toHaveLength(0);
    expect(a.hourly).toHaveLength(24);
    expect(a.weekHourly).toHaveLength(7);
    for (const row of a.weekHourly) expect(row).toHaveLength(24);
  });

  it('groups by project and counts distinct sessions', () => {
    const events = [
      ev({ projectKey: '/a', projectName: 'a', sessionId: 's1', tokens: { input: 100, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ projectKey: '/a', projectName: 'a', sessionId: 's1', tokens: { input: 50,  output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ projectKey: '/a', projectName: 'a', sessionId: 's2', tokens: { input: 25,  output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ projectKey: '/b', projectName: 'b', sessionId: 's3', tokens: { input: 200, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
    ];
    const a = aggregateEvents({ events, pricing: DEFAULT_PRICING });
    expect(a.projects).toHaveLength(2);
    const aProj = a.projects.find((p) => p.key === '/a')!;
    expect(aProj.tokens.input).toBe(175);
    expect(aProj.sessions).toBe(2);
    expect(aProj.messages).toBe(3);
    // Sorted by total tokens desc — /b (200) > /a (175)
    expect(a.projects[0]?.key).toBe('/b');
  });

  it('builds per-session model breakdown', () => {
    const events = [
      ev({ sessionId: 's1', model: 'claude-opus-4-7',   tier: 'opus-4-7',   tokens: { input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ sessionId: 's1', model: 'claude-sonnet-4-6', tier: 'sonnet-4-6', tokens: { input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
    ];
    const a = aggregateEvents({ events, pricing: DEFAULT_PRICING });
    const session = a.sessions[0]!;
    expect(session.models).toHaveLength(2);
    // Sorted by cost desc — Opus ($5) > Sonnet ($3)
    expect(session.models[0]?.tier).toBe('opus-4-7');
    expect(session.models[0]?.cost).toBeCloseTo(5, 8);
    expect(session.models[1]?.tier).toBe('sonnet-4-6');
    expect(session.models[1]?.cost).toBeCloseTo(3, 8);
  });

  it('builds 24 hourly buckets and assigns events to the local hour', () => {
    const ts = at('2026-04-26T15:30:00');
    const events = [ev({ ts, tokens: { input: 10, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } })];
    const a = aggregateEvents({ events, pricing: DEFAULT_PRICING });
    expect(a.hourly).toHaveLength(24);
    const hour = new Date(ts).getHours();
    expect(a.hourly[hour]?.tokens.input).toBe(10);
    // All other hours should still be zero.
    for (let i = 0; i < 24; i++) {
      if (i === hour) continue;
      expect(a.hourly[i]?.tokens.input).toBe(0);
    }
  });

  it('builds 7x24 week-hourly buckets (monday-first)', () => {
    const mondayTen = at('2026-04-27T10:15:00');
    const sundayTwentyThree = at('2026-05-03T23:45:00');
    const events = [
      ev({ ts: mondayTen, tokens: { input: 11, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ ts: sundayTwentyThree, tokens: { input: 0, output: 22, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
    ];
    const a = aggregateEvents({ events, pricing: DEFAULT_PRICING });

    expect(a.weekHourly).toHaveLength(7);
    for (const row of a.weekHourly) expect(row).toHaveLength(24);

    // Monday=0 in monday-first indexing
    expect(a.weekHourly[0]?.[10]?.tokens.input).toBe(11);
    // Sunday=6 in monday-first indexing
    expect(a.weekHourly[6]?.[23]?.tokens.output).toBe(22);
  });

  it('builds daily buckets sorted ascending', () => {
    const events = [
      ev({ ts: at('2026-04-26T10:00:00'), tokens: { input: 1, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ ts: at('2026-04-25T10:00:00'), tokens: { input: 2, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ ts: at('2026-04-26T20:00:00'), tokens: { input: 3, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
    ];
    const a = aggregateEvents({ events, pricing: DEFAULT_PRICING });
    expect(a.daily).toHaveLength(2);
    expect(a.daily[0]!.day < a.daily[1]!.day).toBe(true);
  });

  it('honors the date range filter', () => {
    const events = [
      ev({ ts: at('2026-04-25T10:00:00'), tokens: { input: 1, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ ts: at('2026-04-26T10:00:00'), tokens: { input: 1, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ ts: at('2026-04-27T10:00:00'), tokens: { input: 1, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
    ];
    const a = aggregateEvents({
      events,
      pricing: DEFAULT_PRICING,
      range: { from: '2026-04-26', to: '2026-04-26' },
    });
    expect(a.totals.messages).toBe(1);
    expect(a.daily).toHaveLength(1);
  });

  it('totals.cost equals sum of cost components', () => {
    const events = [
      ev({ tier: 'opus-4-7',   tokens: { input: 1_000_000, output: 1_000_000, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ tier: 'sonnet-4-6', tokens: { input: 0, output: 1_000_000, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
    ];
    const a = aggregateEvents({ events, pricing: DEFAULT_PRICING });
    const c = a.totals.costByComponent;
    expect(a.totals.cost).toBeCloseTo(c.input + c.output + c.cacheRead + c.cacheWrite + c.cacheWrite1h, 8);
    // Opus 4.7: 1M input ($5) + 1M output ($25) = $30; Sonnet 4.6: 1M output = $15; total $45
    expect(a.totals.cost).toBeCloseTo(45, 8);
  });

  it('byModel is sorted by cost desc', () => {
    const events = [
      ev({ tier: 'sonnet-4-6', tokens: { input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
      ev({ tier: 'opus-4-7',   tokens: { input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 } }),
    ];
    const a = aggregateEvents({ events, pricing: DEFAULT_PRICING });
    expect(a.byModel[0]?.tier).toBe('opus-4-7');
  });
});
