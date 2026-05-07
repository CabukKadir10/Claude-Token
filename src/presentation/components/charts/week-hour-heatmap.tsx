'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WeekHourlyBucket } from '@/domain/entities/week-hourly-bucket';
import { totalTokens } from '@/domain/value-objects/tokens';
import { useLocale } from '@/presentation/components/layout/locale-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtFull } from '@/shared/utils/format-number';

interface WeekHourHeatmapProps {
  readonly weekHourly: ReadonlyArray<ReadonlyArray<WeekHourlyBucket>>;
}

/**
 * Monday-first 7x24 heatmap. Cell intensity scales by total tokens.
 */
export function WeekHourHeatmap({ weekHourly }: WeekHourHeatmapProps) {
  const t = useTranslations('timeline.weekHeatmap');
  const { locale } = useLocale();
  const [hovered, setHovered] = useState<WeekHourlyBucket | null>(null);

  const dayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // 2024-01-01 is Monday; noon avoids timezone shifts around midnight.
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(Date.UTC(2024, 0, 1 + i, 12))),
    );
  }, [locale]);

  const maxTokens = useMemo(() => {
    const max = weekHourly.reduce(
      (m, row) => Math.max(m, ...row.map((cell) => totalTokens(cell.tokens))),
      0,
    );
    return Math.max(1, max);
  }, [weekHourly]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        {hovered ? (
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {dayLabels[hovered.weekDay]} {String(hovered.hour).padStart(2, '0')}:00 ·{' '}
            {fmtFull(totalTokens(hovered.tokens), locale)} · {fmtCost(hovered.cost)} ·{' '}
            {fmtFull(hovered.messages, locale)} {t('tooltip.messages')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{t('subtitle')}</span>
        )}
      </CardHeader>
      <CardContent className="pt-1">
        <div className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))] items-center gap-x-1.5 gap-y-1">
          <span />
          {Array.from({ length: 24 }, (_, hour) => (
            <span
              key={`hour-${hour}`}
              className="text-center font-mono text-[10px] text-muted-foreground"
            >
              {hour % 6 === 0 ? String(hour).padStart(2, '0') : ''}
            </span>
          ))}

          {weekHourly.map((row, weekDay) => (
            <Row
              key={`day-${weekDay}`}
              row={row}
              label={dayLabels[weekDay] ?? ''}
              locale={locale}
              maxTokens={maxTokens}
              onHover={setHovered}
              t={t}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  row,
  label,
  locale,
  maxTokens,
  onHover,
  t,
}: {
  row: ReadonlyArray<WeekHourlyBucket>;
  label: string;
  locale: string;
  maxTokens: number;
  onHover: (cell: WeekHourlyBucket | null) => void;
  t: (key: string) => string;
}) {
  return (
    <>
      <span className="pr-1 text-right font-mono text-[10px] text-muted-foreground">{label}</span>
      {row.map((cell) => {
        const tokens = totalTokens(cell.tokens);
        const intensity = Math.max(0.08, tokens / maxTokens);
        return (
          <button
            key={`${cell.weekDay}-${cell.hour}`}
            type="button"
            className="h-5 rounded-[3px] border border-border/50 bg-accent"
            style={{ opacity: intensity }}
            onMouseEnter={() => onHover(cell)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(cell)}
            onBlur={() => onHover(null)}
            aria-label={`${label} ${String(cell.hour).padStart(2, '0')}:00`}
          >
            <span className="sr-only">
              {label} {String(cell.hour).padStart(2, '0')}:00
            </span>
            <title>
              {label} {String(cell.hour).padStart(2, '0')}:00 - {t('tooltip.tokens')}:{' '}
              {fmtFull(tokens, locale)} - {t('tooltip.cost')}: {fmtCost(cell.cost)} -{' '}
              {t('tooltip.messages')}: {fmtFull(cell.messages, locale)}
            </title>
          </button>
        );
      })}
    </>
  );
}
