'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  groupedTotalTokens,
  type GroupByPeriod,
  type GroupedDailyBucket,
} from '@/application/use-cases/group-daily-by';
import type { DailyBucket } from '@/domain/entities/daily-bucket';
import { totalCacheWriteTokens } from '@/domain/value-objects/tokens';
import { useLocale } from '@/presentation/components/layout/locale-provider';
import { useGroupDailyBy } from '@/presentation/hooks/use-group-daily-by';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { cn } from '@/shared/utils/cn';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtCompact } from '@/shared/utils/format-number';

interface ByDateTableProps {
  readonly daily: ReadonlyArray<DailyBucket>;
  readonly onVisibleRowsChange?: (payload: {
    rows: ReadonlyArray<GroupedDailyBucket>;
    period: GroupByPeriod;
  }) => void;
}

type SortKey =
  | 'period'
  | 'cost'
  | 'total'
  | 'input'
  | 'output'
  | 'cacheRead'
  | 'cacheWrite'
  | 'messages'
  | 'sessions'
  | 'projects';
type SortDirection = 'asc' | 'desc';

export function ByDateTable({ daily, onVisibleRowsChange }: ByDateTableProps) {
  const t = useTranslations('byDate');
  const { locale } = useLocale();
  const [period, setPeriod] = useState<GroupByPeriod>('day');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'period',
    direction: 'desc',
  });

  const rows = useGroupDailyBy(daily, period);
  const sortedRows = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => compareRows(a, b, sort.key, sort.direction));
    return arr;
  }, [rows, sort.direction, sort.key]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: key === 'period' ? 'desc' : 'asc' };
    });
  };

  useEffect(() => {
    onVisibleRowsChange?.({ rows: sortedRows, period });
  }, [onVisibleRowsChange, period, sortedRows]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle>{t('title')}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <PeriodButton active={period === 'day'} onClick={() => setPeriod('day')}>
            {t('period.daily')}
          </PeriodButton>
          <PeriodButton active={period === 'week'} onClick={() => setPeriod('week')}>
            {t('period.weekly')}
          </PeriodButton>
          <PeriodButton active={period === 'month'} onClick={() => setPeriod('month')}>
            {t('period.monthly')}
          </PeriodButton>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto p-0">
        {sortedRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <SortableTh label={t('columns.period')} sort={sort} column="period" onToggle={toggleSort} />
                <SortableTh label={t('columns.cost')} sort={sort} column="cost" onToggle={toggleSort} className="text-right" />
                <SortableTh
                  label={t('columns.total')}
                  sort={sort}
                  column="total"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.input')}
                  sort={sort}
                  column="input"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.output')}
                  sort={sort}
                  column="output"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.cacheRead')}
                  sort={sort}
                  column="cacheRead"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.cacheWrite')}
                  sort={sort}
                  column="cacheWrite"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.messages')}
                  sort={sort}
                  column="messages"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.sessions')}
                  sort={sort}
                  column="sessions"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.projects')}
                  sort={sort}
                  column="projects"
                  onToggle={toggleSort}
                  className="text-right"
                />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.periodKey} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{row.periodKey}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">{fmtCost(row.cost)}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {fmtCompact(groupedTotalTokens(row))}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {row.tokens.input.toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {row.tokens.output.toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {row.tokens.cacheRead.toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {totalCacheWriteTokens(row.tokens).toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {row.messages.toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {row.sessions.toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {row.projects.toLocaleString(locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

function PeriodButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button type="button" size="sm" variant={active ? 'default' : 'outline'} onClick={onClick}>
      {children}
    </Button>
  );
}

interface SortableThProps {
  readonly label: string;
  readonly column: SortKey;
  readonly sort: { key: SortKey; direction: SortDirection };
  readonly onToggle: (key: SortKey) => void;
  readonly className?: string;
}

function SortableTh({ label, column, sort, onToggle, className }: SortableThProps) {
  const tA11y = useTranslations('accessibility');
  const isActive = sort.key === column;
  const arrow = !isActive ? '↕' : sort.direction === 'asc' ? '↑' : '↓';
  const a11yState = isActive ? tA11y(sort.direction === 'asc' ? 'sortedAsc' : 'sortedDesc') : '';
  const ariaSort = isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <th className={cn('px-4 py-2 font-medium', className)} aria-sort={ariaSort}>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-left hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onToggle(column)}
        aria-label={`${tA11y('sortBy', { column: label })}${a11yState ? `, ${a11yState}` : ''}`}
      >
        <span>{label}</span>
        <span aria-hidden>{arrow}</span>
      </button>
    </th>
  );
}

function compareRows(
  a: GroupedDailyBucket,
  b: GroupedDailyBucket,
  key: SortKey,
  direction: SortDirection,
): number {
  const dir = direction === 'asc' ? 1 : -1;
  let result = 0;

  switch (key) {
    case 'period':
      result = a.periodKey.localeCompare(b.periodKey);
      break;
    case 'cost':
      result = a.cost - b.cost;
      break;
    case 'total':
      result = groupedTotalTokens(a) - groupedTotalTokens(b);
      break;
    case 'input':
      result = a.tokens.input - b.tokens.input;
      break;
    case 'output':
      result = a.tokens.output - b.tokens.output;
      break;
    case 'cacheRead':
      result = a.tokens.cacheRead - b.tokens.cacheRead;
      break;
    case 'cacheWrite':
      result = totalCacheWriteTokens(a.tokens) - totalCacheWriteTokens(b.tokens);
      break;
    case 'messages':
      result = a.messages - b.messages;
      break;
    case 'sessions':
      result = a.sessions - b.sessions;
      break;
    case 'projects':
      result = a.projects - b.projects;
      break;
  }

  if (result !== 0) return result * dir;
  return b.periodKey.localeCompare(a.periodKey);
}
