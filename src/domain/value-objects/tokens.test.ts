import { describe, it, expect } from 'vitest';
import {
  type Tokens,
  emptyTokens,
  addTokens,
  accumulateTokens,
  totalTokens,
  isEmpty,
  ZERO_TOKENS,
} from './tokens';

const make = (overrides: Partial<Tokens> = {}): Tokens => ({
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  cacheWrite1h: 0,
  ...overrides,
});

describe('emptyTokens', () => {
  it('returns all-zero tokens', () => {
    expect(emptyTokens()).toEqual(ZERO_TOKENS);
  });

  it('returns a fresh object each call', () => {
    const a = emptyTokens();
    const b = emptyTokens();
    expect(a).not.toBe(b);
  });
});

describe('addTokens', () => {
  it('sums every field', () => {
    const a = make({ input: 10, cacheWrite: 5 });
    const b = make({ output: 20, cacheWrite: 7, cacheWrite1h: 3 });
    expect(addTokens(a, b)).toEqual(make({ input: 10, output: 20, cacheWrite: 12, cacheWrite1h: 3 }));
  });

  it('does not mutate inputs', () => {
    const a = make({ input: 1 });
    const b = make({ input: 2 });
    addTokens(a, b);
    expect(a.input).toBe(1);
    expect(b.input).toBe(2);
  });
});

describe('accumulateTokens', () => {
  it('mutates target in place', () => {
    const target = emptyTokens();
    accumulateTokens(target, make({ input: 5, output: 7 }));
    accumulateTokens(target, make({ output: 3, cacheRead: 9 }));
    expect(target).toEqual(make({ input: 5, output: 10, cacheRead: 9 }));
  });
});

describe('totalTokens', () => {
  it('sums all five components', () => {
    expect(totalTokens(make({ input: 1, output: 2, cacheRead: 4, cacheWrite: 8, cacheWrite1h: 16 }))).toBe(31);
  });

  it('is zero for empty tokens', () => {
    expect(totalTokens(emptyTokens())).toBe(0);
  });
});

describe('isEmpty', () => {
  it('true for fresh tokens', () => {
    expect(isEmpty(emptyTokens())).toBe(true);
  });

  it('false when any field is non-zero', () => {
    expect(isEmpty(make({ cacheWrite1h: 1 }))).toBe(false);
  });
});
