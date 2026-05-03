import { describe, it, expect } from 'vitest';
import {
  sessionIdFromFilename,
  cwdHintFromRelativePath,
  projectNameFromCwd,
} from './jsonl-paths';

describe('sessionIdFromFilename', () => {
  it('extracts a UUID from a filename', () => {
    expect(sessionIdFromFilename('a1b2c3d4-e5f6-7890-abcd-ef1234567890.jsonl')).toBe(
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    );
  });

  it('extracts a UUID embedded in a longer name', () => {
    expect(sessionIdFromFilename('prefix-a1b2c3d4-e5f6-7890-abcd-ef1234567890-suffix.jsonl')).toBe(
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    );
  });

  it('falls back to the basename when no UUID is present', () => {
    expect(sessionIdFromFilename('my-custom-name.jsonl')).toBe('my-custom-name');
  });

  it('strips .jsonl case-insensitively', () => {
    expect(sessionIdFromFilename('foo.JSONL')).toBe('foo');
  });
});

describe('cwdHintFromRelativePath', () => {
  it('returns null for null/empty path', () => {
    expect(cwdHintFromRelativePath(null)).toBeNull();
    expect(cwdHintFromRelativePath('')).toBeNull();
  });

  it('decodes the encoded folder back into a /-separated path', () => {
    const rel = 'projects/-Users-kadir-Desktop-MyApp/abc.jsonl';
    expect(cwdHintFromRelativePath(rel)).toBe('/Users/kadir/Desktop/MyApp');
  });

  it('skips the literal "projects" segment', () => {
    const rel = 'projects/-home-user-app/xyz.jsonl';
    expect(cwdHintFromRelativePath(rel)).toBe('/home/user/app');
  });

  it('returns null when no plausible segment exists', () => {
    expect(cwdHintFromRelativePath('only/two/segments.jsonl')).toBeNull();
  });
});

describe('projectNameFromCwd', () => {
  it('takes the last segment of a posix path', () => {
    expect(projectNameFromCwd('/Users/kadir/Desktop/MyApp')).toBe('MyApp');
  });

  it('handles backslashes (Windows cwd)', () => {
    expect(projectNameFromCwd('C:\\Users\\kadir\\Desktop\\MyApp')).toBe('MyApp');
  });

  it('returns "(unknown)" for empty input', () => {
    expect(projectNameFromCwd('')).toBe('(unknown)');
  });

  it('handles trailing slash', () => {
    expect(projectNameFromCwd('/foo/bar/')).toBe('bar');
  });
});
