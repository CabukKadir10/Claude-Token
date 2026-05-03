import { resolveModelTier } from '../../domain/services/resolve-model-tier';
import { dayKeyOf } from '../../domain/value-objects/date-range';
import { totalTokens } from '../../domain/value-objects/tokens';
import type { Tokens } from '../../domain/value-objects/tokens';
import type { UsageEvent } from '../../domain/entities/usage-event';
import { projectNameFromCwd } from './jsonl-paths';

/**
 * Outcome of parsing a single line.
 *
 *  - `event`  — line was a usage record; here is the resulting `UsageEvent`.
 *  - `skip`   — line was valid JSON but has no usage block (e.g. a tool
 *               result or system message). Not an error — silently ignored.
 *  - `error`  — JSON.parse failed. Counted in the parser stats.
 */
export type ParseLineResult =
  | { readonly kind: 'event'; readonly event: UsageEvent }
  | { readonly kind: 'skip' }
  | { readonly kind: 'error' };

/**
 * Parse one JSONL line from a Claude Code session log.
 *
 * The log records both user messages and tool/system events; only those that
 * carry an Anthropic `usage` block contribute tokens. Lines without one are
 * silently skipped.
 */
export function parseJsonlLine(
  line: string,
  fileSessionId: string,
  fileCwdHint: string | null,
): ParseLineResult {
  let raw: unknown;
  try {
    raw = JSON.parse(line);
  } catch {
    return { kind: 'error' };
  }
  if (raw === null || typeof raw !== 'object') return { kind: 'skip' };
  const obj = raw as Record<string, unknown>;

  const usage = extractUsage(obj);
  if (!usage) return { kind: 'skip' };

  const tokens = extractTokens(usage);
  if (totalTokens(tokens) === 0) return { kind: 'skip' };

  const cwd = (typeof obj.cwd === 'string' && obj.cwd) || fileCwdHint || '(unknown)';
  const sessionId =
    (typeof obj.sessionId === 'string' && obj.sessionId) || fileSessionId || '(unknown)';
  const message = obj.message as Record<string, unknown> | undefined;
  const model = typeof message?.model === 'string' ? message.model : null;
  const ts = parseTimestamp(obj.timestamp);

  return {
    kind: 'event',
    event: {
      ts,
      day: dayKeyOf(ts),
      projectKey: cwd,
      projectName: projectNameFromCwd(cwd),
      sessionId,
      model,
      tier: resolveModelTier(model),
      tokens,
    },
  };
}

function extractUsage(obj: Record<string, unknown>): Record<string, unknown> | null {
  const fromMessage = (obj.message as Record<string, unknown> | undefined)?.usage;
  if (fromMessage && typeof fromMessage === 'object') return fromMessage as Record<string, unknown>;
  if (obj.usage && typeof obj.usage === 'object') return obj.usage as Record<string, unknown>;
  return null;
}

function extractTokens(usage: Record<string, unknown>): Tokens {
  const input = num(usage.input_tokens);
  const output = num(usage.output_tokens);
  const cacheRead = num(usage.cache_read_input_tokens);

  // Newer Anthropic responses split cache writes by TTL inside `cache_creation`.
  // Fall back to the flat `cache_creation_input_tokens` for older shapes.
  const cc = usage.cache_creation as Record<string, unknown> | undefined;
  let cacheWrite: number;
  let cacheWrite1h: number;
  if (cc && (typeof cc.ephemeral_5m_input_tokens === 'number' || typeof cc.ephemeral_1h_input_tokens === 'number')) {
    cacheWrite = num(cc.ephemeral_5m_input_tokens);
    cacheWrite1h = num(cc.ephemeral_1h_input_tokens);
  } else {
    cacheWrite = num(usage.cache_creation_input_tokens);
    cacheWrite1h = 0;
  }

  return { input, output, cacheRead, cacheWrite, cacheWrite1h };
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0;
}

function parseTimestamp(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}
