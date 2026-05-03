'use client';

import { useTranslations } from 'next-intl';
import type { Project } from '@/domain/entities/project';
import { totalTokens } from '@/domain/value-objects/tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtCompact } from '@/shared/utils/format-number';
import { useLocale } from '@/presentation/components/layout/locale-provider';

interface TopProjectsListProps {
  readonly projects: ReadonlyArray<Project>;
  /** How many to show. Defaults to 5. */
  readonly limit?: number;
}

/**
 * Card that lists the top-N projects by cost. Each row has a name, a relative
 * cost bar (so the eye picks out distribution at a glance), session count,
 * and total cost. The aggregation is sorted by tokens; we re-sort by cost
 * here because Overview is a cost-first view.
 */
export function TopProjectsList({ projects, limit = 5 }: TopProjectsListProps) {
  const t = useTranslations('overview.topProjects');
  const { locale } = useLocale();

  const ranked = [...projects]
    .filter((p) => p.cost > 0 || totalTokens(p.tokens) > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, limit);

  const maxCost = ranked.length > 0 ? Math.max(...ranked.map((p) => p.cost)) : 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-1">
        {ranked.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {ranked.map((p) => {
              const ratio = maxCost > 0 ? p.cost / maxCost : 0;
              return (
                <li key={p.key} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
                      title={p.key}
                    >
                      {p.name}
                    </span>
                    <span className="shrink-0 font-mono text-sm text-foreground tabular-nums">
                      {fmtCost(p.cost)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${Math.max(ratio * 100, 2)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {p.sessions.toLocaleString(locale)} {t('sessions')} ·{' '}
                      {p.messages.toLocaleString(locale)} {t('messages')}
                    </span>
                    <span className="font-mono tabular-nums">
                      {fmtCompact(totalTokens(p.tokens))} {t('tokens')}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
