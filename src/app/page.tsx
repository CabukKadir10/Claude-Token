'use client';

import { useTranslations } from 'next-intl';
import { AppShell } from '@/presentation/components/layout/app-shell';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Dropzone } from '@/presentation/components/data/dropzone';
import { DateRangeFilter } from '@/presentation/components/filters/date-range-filter';
import { OverviewView } from '@/presentation/views/overview-view';
import { TimelineView } from '@/presentation/views/timeline-view';
import { SessionsView } from '@/presentation/views/sessions-view';
import { ProjectsView } from '@/presentation/views/projects-view';
import { ByDateView } from '@/presentation/views/by-date-view';
import { useEvents } from '@/presentation/hooks/use-events';
import { usePricing } from '@/presentation/hooks/use-pricing';
import { useAggregation } from '@/presentation/hooks/use-aggregation';
import { useFilters } from '@/presentation/hooks/use-filters';

export default function HomePage() {
  const pricing = usePricing();
  const events = useEvents();
  const filters = useFilters();
  const aggregation = useAggregation(events.events, pricing, filters.range);
  const hasData = events.events.length > 0;

  return (
    <AppShell topbarActions={hasData ? <DateRangeFilter filters={filters} /> : null}>
      {(view) => (
        <div className="space-y-4">
          <Dropzone
            status={events.status}
            progress={events.progress}
            stats={events.stats}
            error={events.error}
            onFiles={events.addFiles}
            onClear={events.clear}
          />
          {view === 'overview' && <OverviewView aggregation={aggregation} hasData={hasData} />}
          {view === 'projects' && <ProjectsView aggregation={aggregation} hasData={hasData} />}
          {view === 'sessions' && <SessionsView aggregation={aggregation} hasData={hasData} />}
          {view === 'timeline' && <TimelineView aggregation={aggregation} hasData={hasData} />}
          {view === 'by-date' && <ByDateView aggregation={aggregation} hasData={hasData} />}
          {view !== 'overview' &&
            view !== 'projects' &&
            view !== 'timeline' &&
            view !== 'sessions' &&
            view !== 'by-date' && (
            <ViewPlaceholder view={view} />
            )}
        </div>
      )}
    </AppShell>
  );
}

function ViewPlaceholder({ view }: { view: string }) {
  const t = useTranslations('placeholder');
  return (
    <Card>
      <CardContent className="p-6 text-sm text-muted-foreground">
        <p>{t('viewWillRender', { view })}</p>
      </CardContent>
    </Card>
  );
}
