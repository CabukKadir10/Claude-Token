'use client';

import { useTranslations } from 'next-intl';
import type { ModelBucket } from '@/domain/entities/model-bucket';
import { DEFAULT_PRICING } from '@/domain/value-objects/pricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { DonutChart, type DonutSlice } from '@/presentation/components/charts/donut-chart';
import { colorForTier } from '@/presentation/lib/model-colors';
import { fmtCost } from '@/shared/utils/format-cost';

interface CostByModelCardProps {
  readonly byModel: ReadonlyArray<ModelBucket>;
  readonly totalCost: number;
}

/**
 * "Cost by model" donut card. Pulls slice colors from the tier palette and
 * the human-readable model name from the pricing table's `label`.
 */
export function CostByModelCard({ byModel, totalCost }: CostByModelCardProps) {
  const t = useTranslations('overview.donut');
  const tA11y = useTranslations('accessibility');

  const slices: ReadonlyArray<DonutSlice> = byModel
    .filter((m) => m.cost > 0)
    .map((m) => ({
      id: m.tier,
      label: DEFAULT_PRICING[m.tier].label,
      value: m.cost,
      color: colorForTier(m.tier),
    }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center pt-1">
        {slices.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <DonutChart
            slices={slices}
            centerValue={fmtCost(totalCost)}
            centerLabel={t('totalCost')}
            formatValue={fmtCost}
            ariaLabel={t('title')}
            ariaDescription={tA11y('donutSummary', {
              summary: slices.map((slice) => `${slice.label} ${fmtCost(slice.value)}`).join(', '),
            })}
          />
        )}
      </CardContent>
    </Card>
  );
}
