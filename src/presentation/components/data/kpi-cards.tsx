'use client';

import { useTranslations } from 'next-intl';
import { Coins, DollarSign, MessageSquare, FolderTree, ListTodo } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AggregationTotals } from '@/domain/entities/aggregation';
import { totalTokens } from '@/domain/value-objects/tokens';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtCompact, fmtFull } from '@/shared/utils/format-number';
import { useLocale } from '@/presentation/components/layout/locale-provider';

interface KpiCardsProps {
  readonly totals: AggregationTotals;
}

export function KpiCards({ totals }: KpiCardsProps) {
  const t = useTranslations('overview.kpi');
  const { locale } = useLocale();
  const tokenSum = totalTokens(totals.tokens);

  const items: ReadonlyArray<KpiItem> = [
    {
      label: t('cost'),
      value: fmtCost(totals.cost),
      hint: t('costHint'),
      icon: DollarSign,
    },
    {
      label: t('tokens'),
      value: fmtCompact(tokenSum),
      hint: fmtFull(tokenSum, locale) + ' ' + t('tokensUnit'),
      icon: Coins,
    },
    {
      label: t('messages'),
      value: fmtFull(totals.messages, locale),
      hint: t('messagesHint'),
      icon: MessageSquare,
    },
    {
      label: t('sessions'),
      value: fmtFull(totals.sessions, locale),
      hint: t('sessionsHint'),
      icon: ListTodo,
    },
    {
      label: t('projects'),
      value: fmtFull(totals.projects, locale),
      hint: t('projectsHint'),
      icon: FolderTree,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <KpiCard key={it.label} {...it} />
      ))}
    </div>
  );
}

interface KpiItem {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly icon: LucideIcon;
}

function KpiCard({ label, value, hint, icon: Icon }: KpiItem) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        </div>
        <div className="font-mono text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {value}
        </div>
        <div className="truncate text-xs text-muted-foreground" title={hint}>
          {hint}
        </div>
      </CardContent>
    </Card>
  );
}
