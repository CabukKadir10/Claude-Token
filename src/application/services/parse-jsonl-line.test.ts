import { describe, it, expect } from 'vitest';
import { parseJsonlLine } from './parse-jsonl-line';

const FILE_SID = 'aaaa-bbbb-cccc';

describe('parseJsonlLine', () => {
  it('returns event for a line with usage block', () => {
    const line = JSON.stringify({
      sessionId: 'sess-123',
      cwd: '/Users/k/work/app',
      timestamp: '2026-04-26T12:00:00.000Z',
      message: {
        model: 'claude-opus-4-7-20251219',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          cache_read_input_tokens: 20,
          cache_creation_input_tokens: 10,
        },
      },
    });
    const r = parseJsonlLine(line, FILE_SID, null);
    expect(r.kind).toBe('event');
    if (r.kind !== 'event') return;
    expect(r.event.sessionId).toBe('sess-123');
    expect(r.event.projectKey).toBe('/Users/k/work/app');
    expect(r.event.projectName).toBe('app');
    expect(r.event.tier).toBe('opus-4-7');
    expect(r.event.tokens).toEqual({
      input: 100, output: 50, cacheRead: 20, cacheWrite: 10, cacheWrite1h: 0,
    });
    expect(r.event.ts).toBe(Date.parse('2026-04-26T12:00:00.000Z'));
    expect(r.event.day).not.toBeNull(); // local day
  });

  it('uses cache_creation breakdown (5m + 1h) when present', () => {
    const line = JSON.stringify({
      message: {
        model: 'claude-sonnet-4-6',
        usage: {
          input_tokens: 10,
          cache_creation: {
            ephemeral_5m_input_tokens: 7,
            ephemeral_1h_input_tokens: 3,
          },
        },
      },
    });
    const r = parseJsonlLine(line, FILE_SID, '/cwd/hint');
    expect(r.kind).toBe('event');
    if (r.kind !== 'event') return;
    expect(r.event.tokens.cacheWrite).toBe(7);
    expect(r.event.tokens.cacheWrite1h).toBe(3);
  });

  it('falls back to file-level cwd hint and session id', () => {
    const line = JSON.stringify({
      message: { usage: { input_tokens: 1 } },
    });
    const r = parseJsonlLine(line, FILE_SID, '/hint/path');
    expect(r.kind).toBe('event');
    if (r.kind !== 'event') return;
    expect(r.event.sessionId).toBe(FILE_SID);
    expect(r.event.projectKey).toBe('/hint/path');
  });

  it('skips lines with no usage block', () => {
    const r = parseJsonlLine(JSON.stringify({ type: 'system' }), FILE_SID, null);
    expect(r.kind).toBe('skip');
  });

  it('skips lines whose usage adds up to zero', () => {
    const line = JSON.stringify({ message: { usage: { input_tokens: 0, output_tokens: 0 } } });
    expect(parseJsonlLine(line, FILE_SID, null).kind).toBe('skip');
  });

  it('returns error for malformed JSON', () => {
    expect(parseJsonlLine('{not json', FILE_SID, null).kind).toBe('error');
  });

  it('handles top-level usage (no `message` wrapper)', () => {
    const line = JSON.stringify({ usage: { output_tokens: 5 } });
    const r = parseJsonlLine(line, FILE_SID, null);
    expect(r.kind).toBe('event');
    if (r.kind !== 'event') return;
    expect(r.event.tokens.output).toBe(5);
  });

  it('null timestamp when missing', () => {
    const line = JSON.stringify({ message: { usage: { input_tokens: 1 } } });
    const r = parseJsonlLine(line, FILE_SID, null);
    expect(r.kind).toBe('event');
    if (r.kind !== 'event') return;
    expect(r.event.ts).toBeNull();
    expect(r.event.day).toBeNull();
  });

  it('clamps negative or non-finite usage values to 0', () => {
    const line = JSON.stringify({
      message: {
        usage: {
          input_tokens: -10,
          output_tokens: 'NaN',
          cache_read_input_tokens: Infinity,
          cache_creation_input_tokens: 5,
        },
      },
    });
    const r = parseJsonlLine(line, FILE_SID, null);
    expect(r.kind).toBe('event');
    if (r.kind !== 'event') return;
    expect(r.event.tokens).toEqual({
      input: 0, output: 0, cacheRead: 0, cacheWrite: 5, cacheWrite1h: 0,
    });
  });
});
