import type { Tokens } from '../value-objects/tokens';
import type { ModelTier } from '../value-objects/model-tier';

/**
 * Per-model breakdown inside a session. Useful for the session-detail view
 * which shows how cost splits across the models used in one conversation.
 */
export interface SessionModelBreakdown {
  readonly tier: ModelTier;
  /** The original model string from the log, when only one was seen for this tier. */
  readonly modelLabel: string;
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
}

/**
 * Aggregated stats for one session (one `.jsonl` file).
 * Built by the `aggregate-events` use case.
 */
export interface Session {
  readonly id: string;
  readonly projectKey: string;
  readonly projectName: string;
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
  readonly firstTs: number | null;
  readonly lastTs: number | null;
  readonly models: ReadonlyArray<SessionModelBreakdown>;
}
