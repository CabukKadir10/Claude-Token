'use client';

import { useTranslations } from 'next-intl';
import type { Aggregation } from '@/domain/entities/aggregation';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { KpiCards } from '@/presentation/components/data/kpi-cards';
import { CostByModelCard } from '@/presentation/components/data/cost-by-model-card';
import { TopProjectsList } from '@/presentation/components/data/top-projects-list';
import { ModelBreakdownTable } from '@/presentation/components/data/model-breakdown-table';

interface OverviewViewProps {
  readonly aggregation: Aggregation;
  readonly hasData: boolean;
}

export function OverviewView({ aggregation, hasData }: OverviewViewProps) {
  if (!hasData) return <EmptyState />;

  return (
    <div className="space-y-4">
      <KpiCards totals={aggregation.totals} />
      <div className="grid gap-4 lg:grid-cols-2">
        <CostByModelCard
          byModel={aggregation.byModel}
          totalCost={aggregation.totals.cost}
        />
        <TopProjectsList projects={aggregation.projects} />
      </div>
      <ModelBreakdownTable byModel={aggregation.byModel} />
    </div>
  );
}

function EmptyState() {
  const t = useTranslations('overview.empty');
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-sm font-medium text-foreground">{t('title')}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t('subtitle')}</p>
      </CardContent>
    </Card>
  );
}
