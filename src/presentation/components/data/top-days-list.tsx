'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { DailyBucket } from '@/domain/entities/daily-bucket';
import { totalTokens } from '@/domain/value-objects/tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtCompact, fmtFull } from '@/shared/utils/format-number';
import { useLocale } from '@/presentation/components/layout/locale-provider';

interface TopDaysListProps {
  readonly daily: ReadonlyArray<DailyBucket>;
  readonly limit?: number;
}

/**
 * Top-N busiest days by cost (mirrors the legacy panel). Each row has a mini
 * bar showing the day's share of the leader so the user can eyeball which
 * days dominate without reading the numbers.
 */
export function TopDaysList({ daily, limit = 8 }: TopDaysListProps) {
  const t = useTranslations('timeline.topDays');
  const { locale } = useLocale();

  const top = useMemo(() => {
    const sorted = [...daily].sort((a, b) => b.cost - a.cost).slice(0, limit);
    const max = sorted.reduce((m, d) => Math.max(m, d.cost), 0) || 1;
    return sorted.map((d) => ({ ...d, fraction: d.cost / max }));
  }, [daily, limit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        {top.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="space-y-1.5">
            {top.map((d, i) => (
              <li
                key={d.day}
                className="flex items-center gap-3 rounded px-1 py-1 text-sm hover:bg-muted/50"
              >
                <span className="w-5 shrink-0 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs text-foreground">{d.day}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {fmtFull(d.messages, locale)} {t('messages')} ·{' '}
                    {fmtCompact(totalTokens(d.tokens))} {t('tokens')}
                  </div>
                </div>
                <div className="flex w-32 shrink-0 items-center gap-2">
                  <div
                    className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round(d.fraction * 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0 font-mono text-xs text-foreground tabular-nums">
                    {fmtCost(d.cost)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
