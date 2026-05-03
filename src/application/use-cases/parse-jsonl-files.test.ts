import { describe, it, expect, vi } from 'vitest';
import { parseJsonlFiles } from './parse-jsonl-files';
import type { FileSource } from '../ports/file-source';

class StringFile implements FileSource {
  constructor(
    public readonly name: string,
    private readonly body: string,
    public readonly relativePath: string | null = null,
  ) {}
  async text() { return this.body; }
}

class FailingFile implements FileSource {
  readonly relativePath = null;
  constructor(public readonly name: string) {}
  text(): Promise<string> { return Promise.reject(new Error('boom')); }
}

const lineWith = (sid: string, model: string, input: number) =>
  JSON.stringify({
    sessionId: sid,
    cwd: '/x/y',
    timestamp: '2026-04-26T10:00:00.000Z',
    message: { model, usage: { input_tokens: input } },
  });

describe('parseJsonlFiles', () => {
  it('aggregates events across files and skips blank lines', async () => {
    const f1 = new StringFile(
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890.jsonl',
      [
        lineWith('s1', 'claude-opus-4-7', 100),
        '',
        lineWith('s1', 'claude-opus-4-7', 50),
      ].join('\n'),
    );
    const f2 = new StringFile(
      'session-two.jsonl',
      [lineWith('s2', 'claude-sonnet-4-6', 25)].join('\n'),
    );
    const r = await parseJsonlFiles({ files: [f1, f2] });
    expect(r.fileCount).toBe(2);
    expect(r.lineCount).toBe(3);
    expect(r.events).toHaveLength(3);
    expect(r.parseErrors).toBe(0);
  });

  it('counts malformed lines but keeps parsing', async () => {
    const f = new StringFile(
      'bad.jsonl',
      [
        '{not json',
        lineWith('s1', 'claude-haiku-4-5', 10),
        '{also not json',
      ].join('\n'),
    );
    const r = await parseJsonlFiles({ files: [f] });
    expect(r.events).toHaveLength(1);
    expect(r.parseErrors).toBe(2);
  });

  it('treats a failing file.text() as a parse error and continues', async () => {
    const ok = new StringFile('ok.jsonl', lineWith('s1', 'claude-opus-4-7', 5));
    const r = await parseJsonlFiles({ files: [new FailingFile('bad.jsonl'), ok] });
    expect(r.fileCount).toBe(2);
    expect(r.events).toHaveLength(1);
    expect(r.parseErrors).toBe(1);
  });

  it('reports progress once per file', async () => {
    const onProgress = vi.fn();
    const files = [
      new StringFile('a.jsonl', ''),
      new StringFile('b.jsonl', ''),
      new StringFile('c.jsonl', ''),
    ];
    await parseJsonlFiles({ files, onProgress });
    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 3);
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 3);
    expect(onProgress).toHaveBeenNthCalledWith(3, 3, 3);
  });

  it('uses the cwd hint from a webkitdirectory relative path', async () => {
    const f = new StringFile(
      'sess.jsonl',
      JSON.stringify({ message: { usage: { input_tokens: 1 } } }),
      'projects/-Users-k-app/sess.jsonl',
    );
    const r = await parseJsonlFiles({ files: [f] });
    expect(r.events[0]?.projectKey).toBe('/Users/k/app');
  });
});
