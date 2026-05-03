import { describe, it, expect } from 'vitest';
import { shortSid } from './short-sid';

describe('shortSid', () => {
  it('returns empty string for null / undefined', () => {
    expect(shortSid(null)).toBe('');
    expect(shortSid(undefined)).toBe('');
  });

  it('returns the input for "(unknown)"', () => {
    expect(shortSid('(unknown)')).toBe('(unknown)');
  });

  it('returns short ids unchanged', () => {
    expect(shortSid('abc')).toBe('abc');
    expect(shortSid('14charactersok')).toBe('14charactersok');
  });

  it('elides long UUIDs', () => {
    expect(shortSid('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe('a1b2c3d4…7890');
  });
});
