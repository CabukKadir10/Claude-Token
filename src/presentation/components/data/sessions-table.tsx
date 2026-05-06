'use client';

import { useTranslations } from 'next-intl';
import type { Session } from '@/domain/entities/session';
import { totalTokens } from '@/domain/value-objects/tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { useLocale } from '@/presentation/components/layout/locale-provider';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtCompact } from '@/shared/utils/format-number';
import { formatDateRel, formatDuration } from '@/shared/utils/format-date';
import { shortSid } from '@/shared/utils/short-sid';

interface SessionsTableProps {
  readonly sessions: ReadonlyArray<Session>;
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  const t = useTranslations('sessions');
  const tRel = useTranslations('relativeTime');
  const { locale } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {sessions.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">{t('columns.sid')}</th>
                <th className="px-4 py-2 font-medium">{t('columns.project')}</th>
                <th className="px-4 py-2 font-medium">{t('columns.lastActivity')}</th>
                <th className="px-4 py-2 text-right font-medium">{t('columns.duration')}</th>
                <th className="px-4 py-2 text-right font-medium">{t('columns.messages')}</th>
                <th className="px-4 py-2 font-medium">{t('columns.mainModel')}</th>
                <th className="px-4 py-2 text-right font-medium">{t('columns.tokens')}</th>
                <th className="px-4 py-2 text-right font-medium">{t('columns.cost')}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const rel = formatDateRel(s.lastTs, {
                  labels: {
                    justNow: tRel('justNow'),
                    minutesAgo: (n: number) => tRel('minutesAgo', { n }),
                    hoursAgo: (n: number) => tRel('hoursAgo', { n }),
                    daysAgo: (n: number) => tRel('daysAgo', { n }),
                    unknown: tRel('unknown'),
                  },
                });
                const duration =
                  s.firstTs !== null && s.lastTs !== null
                    ? formatDuration(Math.max(0, s.lastTs - s.firstTs))
                    : '–';
                const mainModel = s.models[0]?.modelLabel ?? '(unknown)';

                return (
                  <tr key={`${s.projectKey}:${s.id}`} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground" title={s.id}>
                      {shortSid(s.id)}
                    </td>
                    <td className="max-w-64 truncate px-4 py-2.5 text-foreground" title={s.projectName}>
                      {s.projectName}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{rel}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {duration}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {s.messages.toLocaleString(locale)}
                    </td>
                    <td className="px-4 py-2.5 text-foreground" title={mainModel}>
                      <span className="inline-block max-w-44 truncate align-bottom">{mainModel}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {fmtCompact(totalTokens(s.tokens))}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">
                      {fmtCost(s.cost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
