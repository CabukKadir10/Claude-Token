import { describe, it, expect } from 'vitest';
import { resolveModelTier } from './resolve-model-tier';

describe('resolveModelTier', () => {
  describe('current naming (claude-<family>-<major>-<minor>)', () => {
    const cases: Array<[string, string]> = [
      ['claude-opus-4-7-20251219', 'opus-4-7'],
      ['claude-opus-4-6', 'opus-4-6'],
      ['claude-opus-4-5', 'opus-4-5'],
      ['claude-opus-4-1', 'opus-4-1'],
      ['claude-sonnet-4-6', 'sonnet-4-6'],
      ['claude-sonnet-4-5-20250101', 'sonnet-4-5'],
      ['claude-haiku-4-5', 'haiku-4-5'],
      ['claude-haiku-3-5', 'haiku-3-5'],
    ];
    for (const [input, tier] of cases) {
      it(`${input} → ${tier}`, () => {
        expect(resolveModelTier(input)).toBe(tier);
      });
    }
  });

  describe('legacy claude-3-* naming', () => {
    it('claude-3-5-sonnet-20241022 → sonnet-3-7 (same price tier)', () => {
      expect(resolveModelTier('claude-3-5-sonnet-20241022')).toBe('sonnet-3-7');
    });
    it('claude-3-7-sonnet → sonnet-3-7', () => {
      expect(resolveModelTier('claude-3-7-sonnet')).toBe('sonnet-3-7');
    });
    it('claude-3-opus → opus-3', () => {
      expect(resolveModelTier('claude-3-opus')).toBe('opus-3');
    });
    it('claude-3-haiku → haiku-3', () => {
      expect(resolveModelTier('claude-3-haiku')).toBe('haiku-3');
    });
    it('claude-3-5-haiku → haiku-3-5', () => {
      expect(resolveModelTier('claude-3-5-haiku')).toBe('haiku-3-5');
    });
  });

  describe('generic family fallback', () => {
    it('claude-opus → opus-4-7 (latest)', () => {
      expect(resolveModelTier('claude-opus')).toBe('opus-4-7');
    });
    it('claude-sonnet → sonnet-4-6 (latest)', () => {
      expect(resolveModelTier('claude-sonnet')).toBe('sonnet-4-6');
    });
    it('claude-haiku → haiku-4-5 (latest)', () => {
      expect(resolveModelTier('claude-haiku')).toBe('haiku-4-5');
    });
    it('opus-4 (no minor) → opus-4', () => {
      expect(resolveModelTier('opus-4')).toBe('opus-4');
    });
    it('sonnet-4 (no minor) → sonnet-4', () => {
      expect(resolveModelTier('sonnet-4')).toBe('sonnet-4');
    });
  });

  describe('non-Claude / unknown', () => {
    it('gpt-4 → default', () => {
      expect(resolveModelTier('gpt-4')).toBe('default');
    });
    it('null → default', () => {
      expect(resolveModelTier(null)).toBe('default');
    });
    it('undefined → default', () => {
      expect(resolveModelTier(undefined)).toBe('default');
    });
    it('empty string → default', () => {
      expect(resolveModelTier('')).toBe('default');
    });
  });

  describe('case insensitivity and dot normalization', () => {
    it('uppercase → matches', () => {
      expect(resolveModelTier('CLAUDE-OPUS-4-7')).toBe('opus-4-7');
    });
    it('dotted version → matches', () => {
      expect(resolveModelTier('claude-opus-4.7')).toBe('opus-4-7');
      expect(resolveModelTier('claude.sonnet.4.6')).toBe('sonnet-4-6');
    });
  });
});
