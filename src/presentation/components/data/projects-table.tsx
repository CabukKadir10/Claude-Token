'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Project } from '@/domain/entities/project';
import { totalTokens } from '@/domain/value-objects/tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { useLocale } from '@/presentation/components/layout/locale-provider';
import { cn } from '@/shared/utils/cn';
import { fmtCost } from '@/shared/utils/format-cost';
import { formatDateRel } from '@/shared/utils/format-date';
import { fmtCompact } from '@/shared/utils/format-number';

interface ProjectsTableProps {
  readonly projects: ReadonlyArray<Project>;
  readonly selectedProjectKey: string | null;
  readonly onSelectProject: (projectKey: string) => void;
}

type SortKey = 'name' | 'sessions' | 'messages' | 'tokens' | 'cost' | 'lastActivity';
type SortDirection = 'asc' | 'desc';

export function ProjectsTable({
  projects,
  selectedProjectKey,
  onSelectProject,
}: ProjectsTableProps) {
  const t = useTranslations('projects');
  const tRel = useTranslations('relativeTime');
  const { locale } = useLocale();
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'cost',
    direction: 'desc',
  });

  const sortedProjects = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => compareProjects(a, b, sort.key, locale, sort.direction));
    return arr;
  }, [locale, projects, sort.direction, sort.key]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: key === 'cost' || key === 'lastActivity' ? 'desc' : 'asc' };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {sortedProjects.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <SortableTh label={t('columns.project')} sort={sort} column="name" onToggle={toggleSort} />
                <SortableTh
                  label={t('columns.sessions')}
                  sort={sort}
                  column="sessions"
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
                  label={t('columns.tokens')}
                  sort={sort}
                  column="tokens"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.cost')}
                  sort={sort}
                  column="cost"
                  onToggle={toggleSort}
                  className="text-right"
                />
                <SortableTh
                  label={t('columns.lastActivity')}
                  sort={sort}
                  column="lastActivity"
                  onToggle={toggleSort}
                />
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((p) => {
                const rel = formatDateRel(p.lastTs, {
                  labels: {
                    justNow: tRel('justNow'),
                    minutesAgo: (n: number) => tRel('minutesAgo', { n }),
                    hoursAgo: (n: number) => tRel('hoursAgo', { n }),
                    daysAgo: (n: number) => tRel('daysAgo', { n }),
                    unknown: tRel('unknown'),
                  },
                });

                return (
                  <tr
                    key={p.key}
                    className={cn(
                      'cursor-pointer border-b border-border transition-colors hover:bg-muted/40 last:border-0',
                      selectedProjectKey === p.key && 'bg-muted/60',
                    )}
                    onClick={() => onSelectProject(p.key)}
                  >
                    <td className="max-w-64 truncate px-4 py-2.5 text-foreground" title={p.key}>
                      {p.name}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {p.sessions.toLocaleString(locale)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {p.messages.toLocaleString(locale)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {fmtCompact(totalTokens(p.tokens))}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">
                      {fmtCost(p.cost)}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{rel}</td>
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
    <th className={cn('px-4 py-2 font-medium', className)}>
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

function compareProjects(
  a: Project,
  b: Project,
  key: SortKey,
  locale: string,
  direction: SortDirection,
): number {
  const dir = direction === 'asc' ? 1 : -1;

  let result = 0;
  switch (key) {
    case 'name':
      result = a.name.localeCompare(b.name, locale);
      break;
    case 'sessions':
      result = a.sessions - b.sessions;
      break;
    case 'messages':
      result = a.messages - b.messages;
      break;
    case 'tokens':
      result = totalTokens(a.tokens) - totalTokens(b.tokens);
      break;
    case 'cost':
      result = a.cost - b.cost;
      break;
    case 'lastActivity':
      result = (a.lastTs ?? -1) - (b.lastTs ?? -1);
      break;
  }

  if (result !== 0) return result * dir;
  return b.cost - a.cost;
}
