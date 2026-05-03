import type { Tokens } from '../value-objects/tokens';

/**
 * Aggregated stats for one project (one cwd) within the active filter range.
 * Built by the `aggregate-events` use case — never constructed by parsing.
 */
export interface Project {
  /** Stable project identifier (raw cwd from the log). */
  readonly key: string;
  /** Display name (last path segment of `key`). */
  readonly name: string;
  readonly tokens: Tokens;
  readonly cost: number;
  readonly messages: number;
  /** Number of distinct sessions seen in this project (within the filter). */
  readonly sessions: number;
  /** Most recent event timestamp; null when no event in this project has a timestamp. */
  readonly lastTs: number | null;
}
