import { describe, it, expect } from 'vitest';
import { BrowserFileSource, browserFilesToSources } from './browser-file-source';

// Node 20+ has `File` available as a global. We use it directly so the test
// runs in the default `node` environment — no jsdom setup needed.

const makeFile = (
  name: string,
  body: string,
  opts?: { webkitRelativePath?: string },
): File => {
  const f = new File([body], name, { type: 'application/json' });
  if (opts?.webkitRelativePath !== undefined) {
    Object.defineProperty(f, 'webkitRelativePath', { value: opts.webkitRelativePath });
  }
  return f;
};

describe('BrowserFileSource', () => {
  it('exposes the file name', () => {
    const src = new BrowserFileSource(makeFile('foo.jsonl', '{}'));
    expect(src.name).toBe('foo.jsonl');
  });

  it('reads text via File.text()', async () => {
    const src = new BrowserFileSource(makeFile('foo.jsonl', 'hello world'));
    expect(await src.text()).toBe('hello world');
  });

  it('returns null relativePath when File has no webkitRelativePath and no override', () => {
    const src = new BrowserFileSource(makeFile('foo.jsonl', ''));
    expect(src.relativePath).toBeNull();
  });

  it('exposes File.webkitRelativePath when present', () => {
    const f = makeFile('foo.jsonl', '', { webkitRelativePath: 'projects/-x-y/foo.jsonl' });
    expect(new BrowserFileSource(f).relativePath).toBe('projects/-x-y/foo.jsonl');
  });

  it('lets the override take precedence over webkitRelativePath', () => {
    const f = makeFile('foo.jsonl', '', { webkitRelativePath: 'a/b.jsonl' });
    expect(new BrowserFileSource(f, 'override/path.jsonl').relativePath).toBe('override/path.jsonl');
  });

  it('treats an empty override string as null', () => {
    expect(new BrowserFileSource(makeFile('foo.jsonl', ''), '').relativePath).toBeNull();
  });
});

describe('browserFilesToSources', () => {
  it('keeps only .jsonl files (case-insensitive)', () => {
    const sources = browserFilesToSources([
      makeFile('a.jsonl', ''),
      makeFile('b.txt', ''),
      makeFile('c.JSONL', ''),
      makeFile('d.json', ''),
    ]);
    expect(sources.map((s) => s.name)).toEqual(['a.jsonl', 'c.JSONL']);
  });
});
