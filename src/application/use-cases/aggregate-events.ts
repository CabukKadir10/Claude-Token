import type { UsageEvent } from '../../domain/entities/usage-event';
import type { Project } from '../../domain/entities/project';
import type { Session, SessionModelBreakdown } from '../../domain/entities/session';
import type { DailyBucket } from '../../domain/entities/daily-bucket';
import type { ModelBucket } from '../../domain/entities/model-bucket';
import type { Aggregation } from '../../domain/entities/aggregation';
import type { Pricing } from '../../domain/value-objects/pricing';
import type { ModelTier } from '../../domain/value-objects/model-tier';
import type { Tokens } from '../../domain/value-objects/tokens';
import type { DateRange } from '../../domain/value-objects/date-range';
import { computeCostBreakdown } from '../../domain/services/compute-cost';
import { emptyTokens, accumulateTokens, totalTokens } from '../../domain/value-objects/tokens';
import { isInRange, UNBOUNDED_RANGE } from '../../domain/value-objects/date-range';

export interface AggregateEventsInput {
  readonly events: ReadonlyArray<UsageEvent>;
  readonly pricing: Pricing;
  /** Defaults to fully unbounded. */
  readonly range?: DateRange;
}

/**
 * Single-pass aggregation of every event into all derived buckets:
 * totals, projects, sessions, daily, hourly (24), and per-model.
 *
 * One pass over the events array; per-event work is O(constant). Internal
 * accumulators use mutable structures and `Set` for distinct counts; the
 * returned shape is fully typed as readonly.
 */
export function aggregateEvents(input: AggregateEventsInput): Aggregation {
  const range = input.range ?? UNBOUNDED_RANGE;

  const projectAcc = new Map<string, ProjectAcc>();
  const sessionAcc = new Map<string, SessionAcc>();
  const dailyAcc = new Map<string, DailyAcc>();
  const hourlyAcc: HourlyAcc[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    tokens: emptyTokens(),
    cost: 0,
    messages: 0,
  }));
  const weekHourlyAcc: WeekHourlyAcc[][] = Array.from({ length: 7 }, (_, weekDay) =>
    Array.from({ length: 24 }, (_, hour) => ({
      weekDay,
      hour,
      tokens: emptyTokens(),
      cost: 0,
      messages: 0,
    })),
  );
  const modelAcc = new Map<ModelTier, ModelAcc>();

  const totalsTokens = emptyTokens();
  const totalsCost = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0, total: 0 };
  let totalMessages = 0;
  const distinctSessions = new Set<string>();
  const distinctProjects = new Set<string>();

  for (const e of input.events) {
    if (!isInRange(e.day, range)) continue;

    const cost = computeCostBreakdown(e.tokens, e.tier, input.pricing);

    accumulateTokens(totalsTokens, e.tokens);
    totalsCost.input += cost.input;
    totalsCost.output += cost.output;
    totalsCost.cacheRead += cost.cacheRead;
    totalsCost.cacheWrite += cost.cacheWrite;
    totalsCost.cacheWrite1h += cost.cacheWrite1h;
    totalsCost.total += cost.total;
    totalMessages += 1;
    distinctSessions.add(e.sessionId);
    distinctProjects.add(e.projectKey);

    accumulateProject(projectAcc, e, cost.total);
    accumulateSession(sessionAcc, e, cost.total);
    if (e.day !== null) accumulateDaily(dailyAcc, e, cost.total);
    if (e.ts !== null) {
      accumulateHourly(hourlyAcc, e, cost.total);
      accumulateWeekHourly(weekHourlyAcc, e, cost.total);
    }
    accumulateModel(modelAcc, e, cost.total);
  }

  const projects: Project[] = Array.from(projectAcc.values())
    .map(materializeProject)
    .sort(byTokensDesc);

  const sessions: Session[] = Array.from(sessionAcc.values())
    .map(materializeSession)
    .sort(byLastTsDesc);

  const daily: DailyBucket[] = Array.from(dailyAcc.values())
    .map(materializeDaily)
    .sort((a, b) => a.day.localeCompare(b.day));

  const byModel: ModelBucket[] = Array.from(modelAcc.values())
    .map(materializeModel)
    .sort((a, b) => b.cost - a.cost);

  return {
    totals: {
      tokens: totalsTokens,
      cost: totalsCost.total,
      messages: totalMessages,
      sessions: distinctSessions.size,
      projects: distinctProjects.size,
      costByComponent: totalsCost,
    },
    projects,
    sessions,
    daily,
    hourly: hourlyAcc,
    weekHourly: weekHourlyAcc,
    byModel,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Internal accumulator types (mutable; never escape this module).

interface ProjectAcc {
  key: string;
  name: string;
  tokens: Tokens;
  cost: number;
  messages: number;
  sessions: Set<string>;
  lastTs: number | null;
}

interface SessionModelAcc {
  tier: ModelTier;
  modelLabel: string;
  tokens: Tokens;
  cost: number;
  messages: number;
}

interface SessionAcc {
  id: string;
  projectKey: string;
  projectName: string;
  tokens: Tokens;
  cost: number;
  messages: number;
  firstTs: number | null;
  lastTs: number | null;
  models: Map<ModelTier, SessionModelAcc>;
}

interface DailyAcc {
  day: string;
  tokens: Tokens;
  cost: number;
  messages: number;
  sessions: Set<string>;
  projects: Set<string>;
}

interface HourlyAcc {
  hour: number;
  tokens: Tokens;
  cost: number;
  messages: number;
}

interface WeekHourlyAcc {
  weekDay: number;
  hour: number;
  tokens: Tokens;
  cost: number;
  messages: number;
}

interface ModelAcc {
  tier: ModelTier;
  tokens: Tokens;
  cost: number;
  messages: number;
  sessions: Set<string>;
  projects: Set<string>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Per-bucket accumulators

function accumulateProject(map: Map<string, ProjectAcc>, e: UsageEvent, cost: number): void {
  let p = map.get(e.projectKey);
  if (!p) {
    p = {
      key: e.projectKey,
      name: e.projectName,
      tokens: emptyTokens(),
      cost: 0,
      messages: 0,
      sessions: new Set(),
      lastTs: e.ts,
    };
    map.set(e.projectKey, p);
  }
  accumulateTokens(p.tokens, e.tokens);
  p.cost += cost;
  p.messages += 1;
  p.sessions.add(e.sessionId);
  if (e.ts !== null && (p.lastTs === null || e.ts > p.lastTs)) p.lastTs = e.ts;
}

function accumulateSession(map: Map<string, SessionAcc>, e: UsageEvent, cost: number): void {
  let s = map.get(e.sessionId);
  if (!s) {
    s = {
      id: e.sessionId,
      projectKey: e.projectKey,
      projectName: e.projectName,
      tokens: emptyTokens(),
      cost: 0,
      messages: 0,
      firstTs: e.ts,
      lastTs: e.ts,
      models: new Map(),
    };
    map.set(e.sessionId, s);
  }
  accumulateTokens(s.tokens, e.tokens);
  s.cost += cost;
  s.messages += 1;
  if (e.ts !== null) {
    if (s.firstTs === null || e.ts < s.firstTs) s.firstTs = e.ts;
    if (s.lastTs === null || e.ts > s.lastTs) s.lastTs = e.ts;
  }

  let m = s.models.get(e.tier);
  if (!m) {
    m = {
      tier: e.tier,
      modelLabel: e.model ?? '(unknown)',
      tokens: emptyTokens(),
      cost: 0,
      messages: 0,
    };
    s.models.set(e.tier, m);
  }
  accumulateTokens(m.tokens, e.tokens);
  m.cost += cost;
  m.messages += 1;
}

function accumulateDaily(map: Map<string, DailyAcc>, e: UsageEvent, cost: number): void {
  // Caller guarantees e.day !== null
  const day = e.day as string;
  let d = map.get(day);
  if (!d) {
    d = {
      day,
      tokens: emptyTokens(),
      cost: 0,
      messages: 0,
      sessions: new Set(),
      projects: new Set(),
    };
    map.set(day, d);
  }
  accumulateTokens(d.tokens, e.tokens);
  d.cost += cost;
  d.messages += 1;
  d.sessions.add(e.sessionId);
  d.projects.add(e.projectKey);
}

function accumulateHourly(buckets: HourlyAcc[], e: UsageEvent, cost: number): void {
  // Caller guarantees e.ts !== null
  const hour = new Date(e.ts as number).getHours();
  const h = buckets[hour]!;
  accumulateTokens(h.tokens, e.tokens);
  h.cost += cost;
  h.messages += 1;
}

function accumulateWeekHourly(buckets: WeekHourlyAcc[][], e: UsageEvent, cost: number): void {
  // Caller guarantees e.ts !== null
  const date = new Date(e.ts as number);
  const hour = date.getHours();
  const weekDay = toMondayFirstWeekDay(date.getDay());
  const cell = buckets[weekDay]![hour]!;
  accumulateTokens(cell.tokens, e.tokens);
  cell.cost += cost;
  cell.messages += 1;
}

function toMondayFirstWeekDay(day: number): number {
  // JS getDay(): Sunday=0..Saturday=6 -> Monday-first 0..6
  return (day + 6) % 7;
}

function accumulateModel(map: Map<ModelTier, ModelAcc>, e: UsageEvent, cost: number): void {
  let m = map.get(e.tier);
  if (!m) {
    m = {
      tier: e.tier,
      tokens: emptyTokens(),
      cost: 0,
      messages: 0,
      sessions: new Set(),
      projects: new Set(),
    };
    map.set(e.tier, m);
  }
  accumulateTokens(m.tokens, e.tokens);
  m.cost += cost;
  m.messages += 1;
  m.sessions.add(e.sessionId);
  m.projects.add(e.projectKey);
}

// ──────────────────────────────────────────────────────────────────────────────
// Materializers (acc → readonly entity)

function materializeProject(p: ProjectAcc): Project {
  return {
    key: p.key,
    name: p.name,
    tokens: p.tokens,
    cost: p.cost,
    messages: p.messages,
    sessions: p.sessions.size,
    lastTs: p.lastTs,
  };
}

function materializeSession(s: SessionAcc): Session {
  const models: SessionModelBreakdown[] = Array.from(s.models.values())
    .map((m) => ({
      tier: m.tier,
      modelLabel: m.modelLabel,
      tokens: m.tokens,
      cost: m.cost,
      messages: m.messages,
    }))
    .sort((a, b) => b.cost - a.cost);
  return {
    id: s.id,
    projectKey: s.projectKey,
    projectName: s.projectName,
    tokens: s.tokens,
    cost: s.cost,
    messages: s.messages,
    firstTs: s.firstTs,
    lastTs: s.lastTs,
    models,
  };
}

function materializeDaily(d: DailyAcc): DailyBucket {
  return {
    day: d.day,
    tokens: d.tokens,
    cost: d.cost,
    messages: d.messages,
    sessions: d.sessions.size,
    projects: d.projects.size,
  };
}

function materializeModel(m: ModelAcc): ModelBucket {
  return {
    tier: m.tier,
    tokens: m.tokens,
    cost: m.cost,
    messages: m.messages,
    sessions: m.sessions.size,
    projects: m.projects.size,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Sort helpers

function byTokensDesc(a: { tokens: Tokens }, b: { tokens: Tokens }): number {
  return totalTokens(b.tokens) - totalTokens(a.tokens);
}

function byLastTsDesc(a: { lastTs: number | null }, b: { lastTs: number | null }): number {
  return (b.lastTs ?? 0) - (a.lastTs ?? 0);
}
