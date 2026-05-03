import type { Pricing } from '../../domain/value-objects/pricing';
import type { ModelTier } from '../../domain/value-objects/model-tier';
import type { KeyValueStore } from '../ports/key-value-store';
import { PRICING_STORAGE_KEY } from '../../shared/constants/storage-keys';

/**
 * Persist the editable numeric fields of the pricing table.
 *
 * Labels are derived from the default table at load time; we do not store them
 * so a future label change in code propagates without a migration.
 */
export function savePricing(store: KeyValueStore, pricing: Pricing): void {
  const compact: Record<string, { in: number; out: number; cr: number; cw5m: number; cw1h: number }> = {};
  for (const tier of Object.keys(pricing) as ModelTier[]) {
    const row = pricing[tier];
    compact[tier] = { in: row.in, out: row.out, cr: row.cr, cw5m: row.cw5m, cw1h: row.cw1h };
  }
  store.set(PRICING_STORAGE_KEY, JSON.stringify(compact));
}

/** Delete persisted overrides — `loadPricing` will then return the defaults. */
export function resetPricing(store: KeyValueStore): void {
  store.remove(PRICING_STORAGE_KEY);
}
