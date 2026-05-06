'use client';

import { useTranslations } from 'next-intl';
import type { Aggregation } from '@/domain/entities/aggregation';
import { ByDateTable } from '@/presentation/components/data/by-date-table';
import { Card, CardContent } from '@/presentation/components/ui/card';

interface ByDateViewProps {
  readonly aggregation: Aggregation;
  readonly hasData: boolean;
}

export function ByDateView({ aggregation, hasData }: ByDateViewProps) {
  if (!hasData) return <EmptyState />;
  return <ByDateTable daily={aggregation.daily} />;
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
