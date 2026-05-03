'use client';

import { useMemo } from 'react';
import type { UsageEvent } from '@/domain/entities/usage-event';
import type { Pricing } from '@/domain/value-objects/pricing';
import type { DateRange } from '@/domain/value-objects/date-range';
import type { Aggregation } from '@/domain/entities/aggregation';
import { aggregateEvents } from '@/application/use-cases/aggregate-events';

/**
 * Memoised wrapper around `aggregateEvents`. Re-aggregates only when one of
 * the three inputs changes by reference, so views that depend on a slice of
 * the result never trigger a recompute on unrelated state changes.
 */
export function useAggregation(
  events: ReadonlyArray<UsageEvent>,
  pricing: Pricing,
  range?: DateRange,
): Aggregation {
  return useMemo(
    () => aggregateEvents({ events, pricing, range }),
    [events, pricing, range],
  );
}
