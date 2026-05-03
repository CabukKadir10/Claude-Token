'use client';

import { useTranslations } from 'next-intl';
import { Calendar, X } from 'lucide-react';
import type { DateRange } from '@/domain/value-objects/date-range';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { cn } from '@/shared/utils/cn';
import type { DatePresetId, UseFiltersResult } from '@/presentation/hooks/use-filters';

interface DateRangeFilterProps {
  readonly filters: UseFiltersResult;
  /** Earliest day key found in the data — used to clamp the inputs. */
  readonly minDay?: string;
  /** Latest day key found in the data — used to clamp the inputs. */
  readonly maxDay?: string;
  readonly disabled?: boolean;
}

const PRESETS: ReadonlyArray<{ id: DatePresetId; key: string }> = [
  { id: 'all', key: 'all' },
  { id: '7d', key: 'last7' },
  { id: '30d', key: 'last30' },
  { id: '90d', key: 'last90' },
];

/**
 * Compact filter row: preset chips on the left, two date inputs on the right.
 * Typing in either input clears the active preset (the hook does this for us).
 */
export function DateRangeFilter({
  filters,
  minDay,
  maxDay,
  disabled = false,
}: DateRangeFilterProps) {
  const t = useTranslations('filters.dateRange');

  const onFromChange = (value: string) => {
    const next: DateRange = { from: value || null, to: filters.range.to };
    filters.setRange(next);
  };
  const onToChange = (value: string) => {
    const next: DateRange = { from: filters.range.from, to: value || null };
    filters.setRange(next);
  };

  const isCustom =
    filters.presetId === null && (filters.range.from !== null || filters.range.to !== null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" aria-hidden />
        <span>{t('label')}</span>
      </div>

      <div className="flex items-center gap-1">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            variant={filters.presetId === p.id ? 'secondary' : 'ghost'}
            size="sm"
            disabled={disabled}
            onClick={() => filters.applyPreset(p.id)}
          >
            {t(`preset.${p.key}`)}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          aria-label={t('from')}
          className={cn('h-8 w-[148px] text-xs')}
          value={filters.range.from ?? ''}
          onChange={(e) => onFromChange(e.target.value)}
          min={minDay}
          max={maxDay}
          disabled={disabled}
        />
        <span className="text-xs text-muted-foreground" aria-hidden>
          —
        </span>
        <Input
          type="date"
          aria-label={t('to')}
          className={cn('h-8 w-[148px] text-xs')}
          value={filters.range.to ?? ''}
          onChange={(e) => onToChange(e.target.value)}
          min={minDay}
          max={maxDay}
          disabled={disabled}
        />
        {isCustom && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={disabled}
            onClick={() => filters.applyPreset('all')}
            aria-label={t('clear')}
            title={t('clear')}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
