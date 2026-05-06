'use client';

import { useEffect, useState } from 'react';
import type { Pricing } from '@/domain/value-objects/pricing';
import { clonePricing } from '@/domain/value-objects/pricing';
import { loadPricing } from '@/application/use-cases/load-pricing';
import { resetPricing as resetPricingUseCase, savePricing } from '@/application/use-cases/save-pricing';
import { localStorageStore } from '@/infrastructure/storage/local-storage-store';

interface UsePricingResult {
  readonly pricing: Pricing;
  readonly setPricing: (next: Pricing) => void;
  readonly resetPricing: () => void;
}

/**
 * Read the active pricing table.
 *
 * Returns the (mutable, fresh-cloned) default pricing on the server pass and
 * during the very first client render to keep hydration stable; after mount
 * it merges any user overrides loaded from `localStorage`.
 *
 * Exposes setters used by the pricing editor so UI can persist user overrides.
 */
export function usePricing(): UsePricingResult {
  const [pricing, setPricing] = useState<Pricing>(() => clonePricing());

  useEffect(() => {
    setPricing(loadPricing(localStorageStore));
  }, []);

  const persistPricing = (next: Pricing) => {
    savePricing(localStorageStore, next);
    setPricing(clonePricing(next));
  };

  const resetPricing = () => {
    resetPricingUseCase(localStorageStore);
    setPricing(clonePricing());
  };

  return {
    pricing,
    setPricing: persistPricing,
    resetPricing,
  };
}
