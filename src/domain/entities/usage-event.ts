import type { Tokens } from '../value-objects/tokens';
import type { ModelTier } from '../value-objects/model-tier';

/**
 * One usage record extracted from a Claude Code `.jsonl` line.
 * One JSONL line that has a `usage` block produces at most one event.
 *
 * Identity: there is no stable id; events are append-only and identified by
 * their position in the in-memory array.
 */
export interface UsageEvent {
  /** Unix ms; null when the source line had no parseable timestamp. */
  readonly ts: number | null;
  /** Local YYYY-MM-DD; null when `ts` is null. */
  readonly day: string | null;
  /** Raw working-directory string from the log (used as project key). */
  readonly projectKey: string;
  /** Display-friendly project name (last path segment of `projectKey`). */
  readonly projectName: string;
  /** UUID-like session identifier (from filename or `sessionId` field). */
  readonly sessionId: string;
  /** Model name as written by Claude Code, e.g. `claude-opus-4-7-20251219`. */
  readonly model: string | null;
  /** The model name normalized to a pricing tier. */
  readonly tier: ModelTier;
  /** Token counts for this single API call. */
  readonly tokens: Tokens;
}
