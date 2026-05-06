import type { DailyBucket } from '../../domain/entities/daily-bucket';
import type { Tokens } from '../../domain/value-objects/tokens';
import { emptyTokens, accumulateTokens, totalTokens } from '../../domain/value-objects/tokens';
import { isoWeekKey } from '../../domain/value-objects/iso-week';

export type GroupByPeriod = 'day' | 'week' | 'month';

export interface GroupDailyByInput {
  readonly daily: ReadonlyArray<DailyBucket>;
  readonly period: GroupByPeriod;
}

export interface GroupedDailyBucket {
  readonly periodKey: string;
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
  readonly sessions: number;
  readonly projects: number;
}

interface GroupAcc {
  periodKey: string;
  tokens: Tokens;
  cost: number;
  messages: number;
  sessions: number;
  projects: number;
}

export function groupDailyBy(input: GroupDailyByInput): ReadonlyArray<GroupedDailyBucket> {
  const map = new Map<string, GroupAcc>();

  for (const bucket of input.daily) {
    const periodKey = toPeriodKey(bucket.day, input.period);
    let acc = map.get(periodKey);
    if (!acc) {
      acc = {
        periodKey,
        tokens: emptyTokens(),
        cost: 0,
        messages: 0,
        sessions: 0,
        projects: 0,
      };
      map.set(periodKey, acc);
    }

    accumulateTokens(acc.tokens, bucket.tokens);
    acc.cost += bucket.cost;
    acc.messages += bucket.messages;
    acc.sessions += bucket.sessions;
    acc.projects += bucket.projects;
  }

  return Array.from(map.values())
    .map((acc) => ({
      periodKey: acc.periodKey,
      tokens: acc.tokens,
      cost: acc.cost,
      messages: acc.messages,
      sessions: acc.sessions,
      projects: acc.projects,
    }))
    .sort((a, b) => a.periodKey.localeCompare(b.periodKey));
}

function toPeriodKey(day: string, period: GroupByPeriod): string {
  if (period === 'day') return day;
  if (period === 'week') return isoWeekKey(day);
  return day.slice(0, 7);
}

export function groupedTotalTokens(row: GroupedDailyBucket): number {
  return totalTokens(row.tokens);
}
