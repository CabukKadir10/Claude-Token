'use client';

import { useEffect, useState } from 'react';
import type { Pricing } from '@/domain/value-objects/pricing';
import { clonePricing } from '@/domain/value-objects/pricing';
import { loadPricing } from '@/application/use-cases/load-pricing';
import { localStorageStore } from '@/infrastructure/storage/local-storage-store';

/**
 * Read the active pricing table.
 *
 * Returns the (mutable, fresh-cloned) default pricing on the server pass and
 * during the very first client render to keep hydration stable; after mount
 * it merges any user overrides loaded from `localStorage`.
 *
 * The pricing UI (Step 11) will expose a setter; for now this hook is read-only.
 */
export function usePricing(): Pricing {
  const [pricing, setPricing] = useState<Pricing>(() => clonePricing());

  useEffect(() => {
    setPricing(loadPricing(localStorageStore));
  }, []);

  return pricing;
}
