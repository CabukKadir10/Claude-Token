import type { KeyValueStore } from '@/application/ports/key-value-store';

/**
 * `KeyValueStore` backed by `window.localStorage`.
 *
 * Two safety nets:
 *   - `typeof window` guard so it can be constructed during SSR without
 *     crashing (every operation becomes a no-op / null).
 *   - try/catch around every storage call: Safari private mode, full quotas,
 *     and disabled-by-policy environments all throw, and we never want a
 *     missing setting to take the app down.
 */
export class LocalStorageStore implements KeyValueStore {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota exceeded, denied, or unavailable — ignore.
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

/** Singleton — preferred over `new LocalStorageStore()` at call sites. */
export const localStorageStore: KeyValueStore = new LocalStorageStore();
