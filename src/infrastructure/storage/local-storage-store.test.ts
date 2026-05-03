import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalStorageStore } from './local-storage-store';

class FakeStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number { return this.map.size; }
  clear(): void { this.map.clear(); }
  getItem(k: string): string | null { return this.map.get(k) ?? null; }
  setItem(k: string, v: string): void { this.map.set(k, v); }
  removeItem(k: string): void { this.map.delete(k); }
  key(i: number): string | null { return Array.from(this.map.keys())[i] ?? null; }
}

let storage: FakeStorage;
let store: LocalStorageStore;

beforeEach(() => {
  storage = new FakeStorage();
  vi.stubGlobal('window', { localStorage: storage });
  store = new LocalStorageStore();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LocalStorageStore', () => {
  it('round-trips a value', () => {
    store.set('k', 'v');
    expect(store.get('k')).toBe('v');
  });

  it('returns null for missing keys', () => {
    expect(store.get('missing')).toBeNull();
  });

  it('removes a key', () => {
    store.set('k', 'v');
    store.remove('k');
    expect(store.get('k')).toBeNull();
  });

  it('does not throw when getItem throws', () => {
    vi.spyOn(storage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => store.get('k')).not.toThrow();
    expect(store.get('k')).toBeNull();
  });

  it('does not throw when setItem throws (quota exceeded)', () => {
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => store.set('k', 'v')).not.toThrow();
  });

  it('does not throw when removeItem throws', () => {
    vi.spyOn(storage, 'removeItem').mockImplementation(() => { throw new Error('denied'); });
    expect(() => store.remove('k')).not.toThrow();
  });

  it('is a no-op (returns null / does nothing) when window is undefined', () => {
    vi.unstubAllGlobals();
    vi.stubGlobal('window', undefined);
    const ssrStore = new LocalStorageStore();
    expect(() => ssrStore.set('k', 'v')).not.toThrow();
    expect(ssrStore.get('k')).toBeNull();
    expect(() => ssrStore.remove('k')).not.toThrow();
  });
});
