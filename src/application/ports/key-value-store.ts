/**
 * Minimal synchronous key-value store interface.
 *
 * Implemented in `infrastructure/storage/local-storage.ts` as a wrapper
 * around `window.localStorage`. Tests provide an in-memory implementation.
 *
 * Keep it sync — `localStorage` is sync, and use cases that depend on
 * settings shouldn't have to await reading them on every render.
 */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}
