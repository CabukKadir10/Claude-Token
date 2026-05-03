import type { Pricing, PricingRow } from '../../domain/value-objects/pricing';
import { clonePricing } from '../../domain/value-objects/pricing';
import { MODEL_TIERS } from '../../domain/value-objects/model-tier';
import type { KeyValueStore } from '../ports/key-value-store';
import { PRICING_STORAGE_KEY } from '../../shared/constants/storage-keys';

/**
 * Load the user's pricing overrides from storage and merge them on top of the
 * default pricing table. Anything missing or invalid silently falls back to the
 * default for that field — corrupt storage never crashes the app.
 */
export function loadPricing(store: KeyValueStore): Pricing {
  const raw = store.get(PRICING_STORAGE_KEY);
  if (!raw) return clonePricing();

  let saved: unknown;
  try {
    saved = JSON.parse(raw);
  } catch {
    return clonePricing();
  }
  if (saved === null || typeof saved !== 'object') return clonePricing();

  return mergeOverrides(saved as Record<string, unknown>);
}

const NUMERIC_FIELDS = ['in', 'out', 'cr', 'cw5m', 'cw1h'] as const satisfies ReadonlyArray<
  keyof PricingRow
>;

function mergeOverrides(saved: Record<string, unknown>): Pricing {
  const base = clonePricing();
  for (const tier of MODEL_TIERS) {
    const override = saved[tier];
    if (!override || typeof override !== 'object') continue;
    const target = base[tier] as { -readonly [K in keyof PricingRow]: PricingRow[K] };
    const src = override as Record<string, unknown>;
    for (const field of NUMERIC_FIELDS) {
      const candidate = src[field];
      const n = typeof candidate === 'number' ? candidate : Number(candidate);
      if (Number.isFinite(n) && n >= 0) target[field] = n;
    }
  }
  return base;
}
