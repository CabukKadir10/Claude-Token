'use client';

import { useTranslations } from 'next-intl';
import type { GroupByPeriod, GroupedDailyBucket } from '@/application/use-cases/group-daily-by';
import type { Aggregation } from '@/domain/entities/aggregation';
import { ByDateTable } from '@/presentation/components/data/by-date-table';
import { Card, CardContent } from '@/presentation/components/ui/card';

interface ByDateViewProps {
  readonly aggregation: Aggregation;
  readonly hasData: boolean;
  readonly onVisibleRowsChange?: (payload: {
    rows: ReadonlyArray<GroupedDailyBucket>;
    period: GroupByPeriod;
  }) => void;
}

export function ByDateView({ aggregation, hasData, onVisibleRowsChange }: ByDateViewProps) {
  if (!hasData) return <EmptyState />;
  return <ByDateTable daily={aggregation.daily} onVisibleRowsChange={onVisibleRowsChange} />;
}

function EmptyState() {
  const t = useTranslations('byDate.emptyState');
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-sm font-medium text-foreground">{t('title')}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t('subtitle')}</p>
      </CardContent>
    </Card>
  );
}
