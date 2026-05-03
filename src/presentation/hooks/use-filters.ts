'use client';

import { useCallback, useMemo, useState } from 'react';
import { dayKey, UNBOUNDED_RANGE, type DateRange } from '@/domain/value-objects/date-range';

export type DatePresetId = 'all' | '7d' | '30d' | '90d';

export interface UseFiltersResult {
  readonly range: DateRange;
  readonly presetId: DatePresetId | null;
  readonly setRange: (range: DateRange) => void;
  readonly applyPreset: (id: DatePresetId) => void;
  readonly reset: () => void;
}

/**
 * Single source of truth for cross-view filters. Right now this only holds a
 * `DateRange`, but it is shaped as a hook so additional filters (model tier,
 * project, session) can plug in without rewiring callers.
 *
 * `presetId` lets the UI highlight an active preset chip; it stays `null`
 * once the user types into a date input so we don't lie about which preset
 * the current range matches.
 */
export function useFilters(now: () => Date = () => new Date()): UseFiltersResult {
  const [range, setRangeState] = useState<DateRange>(UNBOUNDED_RANGE);
  const [presetId, setPresetId] = useState<DatePresetId | null>('all');

  const setRange = useCallback((next: DateRange) => {
    setRangeState(next);
    setPresetId(null);
  }, []);

  const applyPreset = useCallback(
    (id: DatePresetId) => {
      setPresetId(id);
      if (id === 'all') {
        setRangeState(UNBOUNDED_RANGE);
        return;
      }
      const days = id === '7d' ? 7 : id === '30d' ? 30 : 90;
      const today = now();
      const from = new Date(today);
      from.setDate(from.getDate() - (days - 1));
      setRangeState({ from: dayKey(from), to: dayKey(today) });
    },
    [now],
  );

  const reset = useCallback(() => {
    setRangeState(UNBOUNDED_RANGE);
    setPresetId('all');
  }, []);

  return useMemo(
    () => ({ range, presetId, setRange, applyPreset, reset }),
    [range, presetId, setRange, applyPreset, reset],
  );
}
