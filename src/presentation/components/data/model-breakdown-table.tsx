'use client';

import { useTranslations } from 'next-intl';
import type { ModelBucket } from '@/domain/entities/model-bucket';
import { totalTokens } from '@/domain/value-objects/tokens';
import { DEFAULT_PRICING } from '@/domain/value-objects/pricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtCompact, fmtFull } from '@/shared/utils/format-number';
import { colorForTier } from '@/presentation/lib/model-colors';
import { useLocale } from '@/presentation/components/layout/locale-provider';

interface ModelBreakdownTableProps {
  readonly byModel: ReadonlyArray<ModelBucket>;
}

/**
 * One row per pricing tier (only tiers that produced events), sorted by cost
 * desc. The leading swatch reuses the same `MODEL_TIER_COLOR` palette as the
 * donut so the eye can connect the two.
 */
export function ModelBreakdownTable({ byModel }: ModelBreakdownTableProps) {
  const t = useTranslations('overview.modelBreakdown');
  const { locale } = useLocale();

  if (byModel.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">{t('empty')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2 font-medium">{t('model')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('cost')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('tokens')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('messages')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('sessions')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('projects')}</th>
            </tr>
          </thead>
          <tbody>
            {byModel.map((m) => (
              <tr key={m.tier} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: colorForTier(m.tier) }}
                    />
                    <span className="text-foreground">{DEFAULT_PRICING[m.tier].label}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">
                  {fmtCost(m.cost)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                  {fmtCompact(totalTokens(m.tokens))}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                  {fmtFull(m.messages, locale)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                  {fmtFull(m.sessions, locale)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                  {fmtFull(m.projects, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
