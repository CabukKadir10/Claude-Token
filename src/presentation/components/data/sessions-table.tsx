'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Session } from '@/domain/entities/session';
import { totalTokens } from '@/domain/value-objects/tokens';
import { SessionDetailDrawer } from '@/presentation/components/data/session-detail-drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { useLocale } from '@/presentation/components/layout/locale-provider';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtCompact } from '@/shared/utils/format-number';
import { formatDateRel, formatDuration } from '@/shared/utils/format-date';
import { shortSid } from '@/shared/utils/short-sid';

interface SessionsTableProps {
  readonly sessions: ReadonlyArray<Session>;
  readonly compact?: boolean;
  readonly projectKeyFilter?: string | null;
}

type SortKey = 'sid' | 'project' | 'lastActivity' | 'duration' | 'messages' | 'mainModel' | 'tokens' | 'cost';
type SortDirection = 'asc' | 'desc';

export function SessionsTable({
  sessions,
  compact = false,
  projectKeyFilter = null,
}: SessionsTableProps) {
  const t = useTranslations('sessions');
  const tRel = useTranslations('relativeTime');
  const { locale } = useLocale();
  const [query, setQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'lastActivity',
    direction: 'desc',
  });

  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const sourceSessions = useMemo(() => {
    if (!projectKeyFilter) return sessions;
    return sessions.filter((s) => s.projectKey === projectKeyFilter);
  }, [projectKeyFilter, sessions]);

  const filteredSessions = useMemo(() => {
    if (!normalizedQuery) return sourceSessions;
    return sourceSessions.filter((s) => {
      const inProject = s.projectName.toLocaleLowerCase(locale).includes(normalizedQuery);
      const inId = s.id.toLocaleLowerCase(locale).includes(normalizedQuery);
      return inProject || inId;
    });
  }, [locale, normalizedQuery, sourceSessions]);

  const sortedSessions = useMemo(() => {
    const arr = [...filteredSessions];
    arr.sort((a, b) => compareSessions(a, b, sort.key, locale, sort.direction));
    return arr;
  }, [filteredSessions, locale, sort.direction, sort.key]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: key === 'lastActivity' ? 'desc' : 'asc' };
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="gap-3">
          <CardTitle>{compact ? t('compactTitle') : t('title')}</CardTitle>
          {!compact && (
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="max-w-md"
              aria-label={t('searchPlaceholder')}
            />
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {sourceSessions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {projectKeyFilter ? t('emptyForProject') : t('empty')}
            </p>
          ) : sortedSessions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t('noResults')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <SortableTh label={t('columns.sid')} sort={sort} column="sid" onToggle={toggleSort} />
                  {!projectKeyFilter && (
                    <SortableTh label={t('columns.project')} sort={sort} column="project" onToggle={toggleSort} />
                  )}
                  <SortableTh
                    label={t('columns.lastActivity')}
                    sort={sort}
                    column="lastActivity"
                    onToggle={toggleSort}
                  />
                  <SortableTh
                    label={t('columns.messages')}
                    sort={sort}
                    column="messages"
                    onToggle={toggleSort}
                    className="text-right"
                  />
                  {!compact && (
                    <>
                      <SortableTh
                        label={t('columns.duration')}
                        sort={sort}
                        column="duration"
                        onToggle={toggleSort}
                        className="text-right"
                      />
                      <SortableTh
                        label={t('columns.mainModel')}
                        sort={sort}
                        column="mainModel"
                        onToggle={toggleSort}
                      />
                    </>
                  )}
                  <SortableTh
                    label={t('columns.tokens')}
                    sort={sort}
                    column="tokens"
                    onToggle={toggleSort}
                    className="text-right"
                  />
                  <SortableTh label={t('columns.cost')} sort={sort} column="cost" onToggle={toggleSort} className="text-right" />
                </tr>
              </thead>
              <tbody>
                {sortedSessions.map((s) => {
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
                      : t('unknown');
                  const mainModel = s.models[0]?.modelLabel || t('unknown');

                  return (
                    <tr
                      key={`${s.projectKey}:${s.id}`}
                      className="cursor-pointer border-b border-border transition-colors hover:bg-muted/40 last:border-0"
                      onClick={() => setSelectedSession(s)}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-foreground" title={s.id}>
                        {shortSid(s.id)}
                      </td>
                      {!projectKeyFilter && (
                        <td className="max-w-64 truncate px-4 py-2.5 text-foreground" title={s.projectName}>
                          {s.projectName}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-muted-foreground">{rel}</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                        {s.messages.toLocaleString(locale)}
                      </td>
                      {!compact && (
                        <>
                          <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                            {duration}
                          </td>
                          <td className="px-4 py-2.5 text-foreground" title={mainModel}>
                            <span className="inline-block max-w-44 truncate align-bottom">{mainModel}</span>
                          </td>
                        </>
                      )}
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

      <SessionDetailDrawer
        session={selectedSession}
        open={selectedSession !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null);
        }}
      />
    </>
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
  const isActive = sort.key === column;
  const arrow = !isActive ? '↕' : sort.direction === 'asc' ? '↑' : '↓';

  return (
    <th className={`px-4 py-2 font-medium ${className ?? ''}`}>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-left hover:text-foreground"
        onClick={() => onToggle(column)}
      >
        <span>{label}</span>
        <span aria-hidden>{arrow}</span>
      </button>
    </th>
  );
}

function compareSessions(
  a: Session,
  b: Session,
  key: SortKey,
  locale: string,
  direction: SortDirection,
): number {
  const dir = direction === 'asc' ? 1 : -1;
  const aDuration = a.firstTs !== null && a.lastTs !== null ? Math.max(0, a.lastTs - a.firstTs) : -1;
  const bDuration = b.firstTs !== null && b.lastTs !== null ? Math.max(0, b.lastTs - b.firstTs) : -1;
  const aMainModel = a.models[0]?.modelLabel ?? '';
  const bMainModel = b.models[0]?.modelLabel ?? '';

  let result = 0;
  switch (key) {
    case 'sid':
      result = a.id.localeCompare(b.id, locale);
      break;
    case 'project':
      result = a.projectName.localeCompare(b.projectName, locale);
      break;
    case 'lastActivity':
      result = (a.lastTs ?? -1) - (b.lastTs ?? -1);
      break;
    case 'duration':
      result = aDuration - bDuration;
      break;
    case 'messages':
      result = a.messages - b.messages;
      break;
    case 'mainModel':
      result = aMainModel.localeCompare(bMainModel, locale);
      break;
    case 'tokens':
      result = totalTokens(a.tokens) - totalTokens(b.tokens);
      break;
    case 'cost':
      result = a.cost - b.cost;
      break;
  }

  if (result !== 0) return result * dir;
  return ((a.lastTs ?? -1) - (b.lastTs ?? -1)) * -1;
}
