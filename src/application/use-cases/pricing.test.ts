import { describe, it, expect, beforeEach } from 'vitest';
import { loadPricing } from './load-pricing';
import { savePricing, resetPricing } from './save-pricing';
import { DEFAULT_PRICING } from '../../domain/value-objects/pricing';
import { PRICING_STORAGE_KEY } from '../../shared/constants/storage-keys';
import type { KeyValueStore } from '../ports/key-value-store';

class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  get(k: string) { return this.map.get(k) ?? null; }
  set(k: string, v: string) { this.map.set(k, v); }
  remove(k: string) { this.map.delete(k); }
}

let store: MemoryStore;

beforeEach(() => {
  store = new MemoryStore();
});

describe('loadPricing', () => {
  it('returns defaults when storage is empty', () => {
    const p = loadPricing(store);
    expect(p['opus-4-7'].in).toBe(DEFAULT_PRICING['opus-4-7'].in);
  });

  it('returns defaults when storage has invalid JSON', () => {
    store.set(PRICING_STORAGE_KEY, '{not json');
    const p = loadPricing(store);
    expect(p['opus-4-7'].in).toBe(DEFAULT_PRICING['opus-4-7'].in);
  });

  it('returns defaults when storage value is not an object', () => {
    store.set(PRICING_STORAGE_KEY, '"some string"');
    expect(loadPricing(store)['opus-4-7'].in).toBe(DEFAULT_PRICING['opus-4-7'].in);
  });

  it('merges valid override fields and ignores garbage', () => {
    store.set(PRICING_STORAGE_KEY, JSON.stringify({
      'opus-4-7': { in: 7.5, out: 'not a number', cw5m: -1, label: 'evil' },
      'unknown-tier': { in: 100 },
    }));
    const p = loadPricing(store);
    expect(p['opus-4-7'].in).toBe(7.5);
    expect(p['opus-4-7'].out).toBe(DEFAULT_PRICING['opus-4-7'].out);
    expect(p['opus-4-7'].cw5m).toBe(DEFAULT_PRICING['opus-4-7'].cw5m);
    // Label always comes from defaults — never persisted.
    expect(p['opus-4-7'].label).toBe(DEFAULT_PRICING['opus-4-7'].label);
  });
});

describe('savePricing', () => {
  it('round-trips overrides through load+save', () => {
    const initial = loadPricing(store);
    const tweaked = JSON.parse(JSON.stringify(initial));
    tweaked['sonnet-4-6'].in = 9.99;
    savePricing(store, tweaked);
    const reloaded = loadPricing(store);
    expect(reloaded['sonnet-4-6'].in).toBe(9.99);
  });

  it('does not persist labels', () => {
    savePricing(store, DEFAULT_PRICING);
    const raw = JSON.parse(store.get(PRICING_STORAGE_KEY)!);
    for (const tier of Object.keys(raw)) {
      expect(raw[tier]).not.toHaveProperty('label');
    }
  });
});

describe('resetPricing', () => {
  it('removes the persisted entry so loadPricing returns defaults', () => {
    savePricing(store, DEFAULT_PRICING);
    expect(store.get(PRICING_STORAGE_KEY)).not.toBeNull();
    resetPricing(store);
    expect(store.get(PRICING_STORAGE_KEY)).toBeNull();
    expect(loadPricing(store)['opus-4-7'].in).toBe(DEFAULT_PRICING['opus-4-7'].in);
  });
});
