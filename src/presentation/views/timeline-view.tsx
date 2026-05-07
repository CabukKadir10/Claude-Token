'use client';

import { useTranslations } from 'next-intl';
import type { Aggregation } from '@/domain/entities/aggregation';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { DailyTimelineChart } from '@/presentation/components/charts/daily-timeline-chart';
import { HourBarChart } from '@/presentation/components/charts/hour-bar-chart';
import { WeekHourHeatmap } from '@/presentation/components/charts/week-hour-heatmap';
import { TopDaysList } from '@/presentation/components/data/top-days-list';

interface TimelineViewProps {
  readonly aggregation: Aggregation;
  readonly hasData: boolean;
}

export function TimelineView({ aggregation, hasData }: TimelineViewProps) {
  if (!hasData) return <EmptyState />;

  const { daily, hourly, weekHourly } = aggregation;

  if (daily.length === 0) return <NoTimestampState />;

  return (
    <div className="space-y-4">
      <DailyTimelineChart daily={daily} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopDaysList daily={daily} />
        <HourBarChart hourly={hourly} />
        <div className="lg:col-span-2">
          <WeekHourHeatmap weekHourly={weekHourly} />
        </div>
      </div>
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

function NoTimestampState() {
  const t = useTranslations('timeline');
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-sm font-medium text-foreground">{t('noTimestamps.title')}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t('noTimestamps.subtitle')}</p>
      </CardContent>
    </Card>
  );
}
