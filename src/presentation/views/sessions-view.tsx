'use client';

import { useTranslations } from 'next-intl';
import type { Aggregation } from '@/domain/entities/aggregation';
import type { Session } from '@/domain/entities/session';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { SessionsTable } from '@/presentation/components/data/sessions-table';

interface SessionsViewProps {
  readonly aggregation: Aggregation;
  readonly hasData: boolean;
  readonly onVisibleRowsChange?: (rows: ReadonlyArray<Session>) => void;
}

export function SessionsView({ aggregation, hasData, onVisibleRowsChange }: SessionsViewProps) {
  if (!hasData) return <EmptyState />;
  return <SessionsTable sessions={aggregation.sessions} onVisibleRowsChange={onVisibleRowsChange} />;
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
