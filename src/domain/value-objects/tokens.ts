/**
 * Token counts for a single Claude API call or aggregated bucket.
 * All counts are in raw tokens (not divided by 1M).
 */
export interface Tokens {
  readonly input: number;
  readonly output: number;
  readonly cacheRead: number;
  /** Cache write at the 5-minute TTL price tier. */
  readonly cacheWrite: number;
  /** Cache write at the 1-hour TTL price tier. */
  readonly cacheWrite1h: number;
}

export const ZERO_TOKENS: Tokens = Object.freeze({
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  cacheWrite1h: 0,
});

export function emptyTokens(): Tokens {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 };
}

export function addTokens(a: Tokens, b: Tokens): Tokens {
  return {
    input: a.input + b.input,
    output: a.output + b.output,
    cacheRead: a.cacheRead + b.cacheRead,
    cacheWrite: a.cacheWrite + b.cacheWrite,
    cacheWrite1h: a.cacheWrite1h + b.cacheWrite1h,
  };
}

/** In-place addition. Use only on a Tokens value you own (e.g. a fresh accumulator). */
export function accumulateTokens(target: Tokens, source: Tokens): void {
  const t = target as { -readonly [K in keyof Tokens]: number };
  t.input += source.input;
  t.output += source.output;
  t.cacheRead += source.cacheRead;
  t.cacheWrite += source.cacheWrite;
  t.cacheWrite1h += source.cacheWrite1h;
}

export function totalTokens(t: Tokens): number {
  return t.input + t.output + t.cacheRead + t.cacheWrite + t.cacheWrite1h;
}

export function isEmpty(t: Tokens): boolean {
  return totalTokens(t) === 0;
}
