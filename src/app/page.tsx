'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { GroupByPeriod, GroupedDailyBucket } from '@/application/use-cases/group-daily-by';
import type { Project } from '@/domain/entities/project';
import type { Session } from '@/domain/entities/session';
import { totalTokens, totalCacheWriteTokens } from '@/domain/value-objects/tokens';
import type { ViewId } from '@/presentation/components/layout/sidebar';
import { AppShell } from '@/presentation/components/layout/app-shell';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Dropzone } from '@/presentation/components/data/dropzone';
import { ExportMenu } from '@/presentation/components/data/export-menu';
import { PricingEditor } from '@/presentation/components/data/pricing-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { DateRangeFilter } from '@/presentation/components/filters/date-range-filter';
import { OverviewView } from '@/presentation/views/overview-view';
import { TimelineView } from '@/presentation/views/timeline-view';
import { SessionsView } from '@/presentation/views/sessions-view';
import { ProjectsView } from '@/presentation/views/projects-view';
import { ByDateView } from '@/presentation/views/by-date-view';
import type { ActionId } from '@/presentation/components/layout/sidebar';
import { useEvents } from '@/presentation/hooks/use-events';
import { usePricing } from '@/presentation/hooks/use-pricing';
import { useAggregation } from '@/presentation/hooks/use-aggregation';
import { useFilters } from '@/presentation/hooks/use-filters';
import { groupedTotalTokens } from '@/application/use-cases/group-daily-by';
import { formatDateRel, formatDuration } from '@/shared/utils/format-date';
import { shortSid } from '@/shared/utils/short-sid';

type SessionsExportRow = {
  sid: string;
  project: string;
  lastActivity: string;
  messages: number;
  duration: string;
  mainModel: string;
  tokens: number;
  cost: number;
};

type ProjectsExportRow = {
  project: string;
  sessions: number;
  messages: number;
  tokens: number;
  cost: number;
  lastActivity: string;
};

type ByDateExportRow = {
  period: string;
  cost: number;
  total: number;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  messages: number;
  sessions: number;
  projects: number;
};

export default function HomePage() {
  const tActions = useTranslations('sidebarActions');
  const tRel = useTranslations('relativeTime');
  const tSessions = useTranslations('sessions');
  const tProjects = useTranslations('projects');
  const tByDate = useTranslations('byDate');
  const pricing = usePricing();
  const events = useEvents();
  const filters = useFilters();
  const aggregation = useAggregation(events.events, pricing.pricing, filters.range);
  const hasData = events.events.length > 0;
  const [pricingOpen, setPricingOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [reloadPickerRequest, setReloadPickerRequest] = useState(0);
  const [visibleSessions, setVisibleSessions] = useState<ReadonlyArray<Session>>([]);
  const [visibleProjects, setVisibleProjects] = useState<ReadonlyArray<Project>>([]);
  const [visibleByDate, setVisibleByDate] = useState<{
    rows: ReadonlyArray<GroupedDailyBucket>;
    period: GroupByPeriod;
  }>({ rows: [], period: 'day' });

  const handleSidebarAction = async (id: ActionId) => {
    if (id === 'pricing') {
      setPricingOpen(true);
      return;
    }

    if (id === 'reload') {
      const reloaded = await events.reloadLast();
      if (!reloaded) setReloadPickerRequest((prev) => prev + 1);
      return;
    }

    if (id === 'clear') {
      setClearDialogOpen(true);
    }
  };

  const handleClearConfirm = () => {
    events.clear();
    filters.reset();
    setClearDialogOpen(false);
  };

  const sessionsExportRows: ReadonlyArray<SessionsExportRow> = visibleSessions.map((session) => ({
    sid: shortSid(session.id),
    project: session.projectName,
    lastActivity: formatDateRel(session.lastTs, {
      labels: {
        justNow: tRel('justNow'),
        minutesAgo: (n: number) => tRel('minutesAgo', { n }),
        hoursAgo: (n: number) => tRel('hoursAgo', { n }),
        daysAgo: (n: number) => tRel('daysAgo', { n }),
        unknown: tRel('unknown'),
      },
    }),
    messages: session.messages,
    duration:
      session.firstTs !== null && session.lastTs !== null
        ? formatDuration(Math.max(0, session.lastTs - session.firstTs))
        : tSessions('unknown'),
    mainModel: session.models[0]?.modelLabel || tSessions('unknown'),
    tokens: totalTokens(session.tokens),
    cost: session.cost,
  }));

  const projectsExportRows: ReadonlyArray<ProjectsExportRow> = visibleProjects.map((project) => ({
    project: project.name,
    sessions: project.sessions,
    messages: project.messages,
    tokens: totalTokens(project.tokens),
    cost: project.cost,
    lastActivity: formatDateRel(project.lastTs, {
      labels: {
        justNow: tRel('justNow'),
        minutesAgo: (n: number) => tRel('minutesAgo', { n }),
        hoursAgo: (n: number) => tRel('hoursAgo', { n }),
        daysAgo: (n: number) => tRel('daysAgo', { n }),
        unknown: tRel('unknown'),
      },
    }),
  }));

  const byDateExportRows: ReadonlyArray<ByDateExportRow> = visibleByDate.rows.map((row) => ({
    period: row.periodKey,
    cost: row.cost,
    total: groupedTotalTokens(row),
    input: row.tokens.input,
    output: row.tokens.output,
    cacheRead: row.tokens.cacheRead,
    cacheWrite: totalCacheWriteTokens(row.tokens),
    messages: row.messages,
    sessions: row.sessions,
    projects: row.projects,
  }));

  const renderTopbarActions = (view: ViewId) => {
    if (!hasData) return null;

    return (
      <>
        <DateRangeFilter filters={filters} />
        {view === 'sessions' && (
          <ExportMenu
            viewKey="sessions"
            rows={sessionsExportRows}
            columns={[
              { key: 'sid', header: tSessions('columns.sid') },
              { key: 'project', header: tSessions('columns.project') },
              { key: 'lastActivity', header: tSessions('columns.lastActivity') },
              { key: 'messages', header: tSessions('columns.messages') },
              { key: 'duration', header: tSessions('columns.duration') },
              { key: 'mainModel', header: tSessions('columns.mainModel') },
              { key: 'tokens', header: tSessions('columns.tokens') },
              { key: 'cost', header: tSessions('columns.cost') },
            ]}
          />
        )}
        {view === 'projects' && (
          <ExportMenu
            viewKey="projects"
            rows={projectsExportRows}
            columns={[
              { key: 'project', header: tProjects('columns.project') },
              { key: 'sessions', header: tProjects('columns.sessions') },
              { key: 'messages', header: tProjects('columns.messages') },
              { key: 'tokens', header: tProjects('columns.tokens') },
              { key: 'cost', header: tProjects('columns.cost') },
              { key: 'lastActivity', header: tProjects('columns.lastActivity') },
            ]}
          />
        )}
        {view === 'by-date' && (
          <ExportMenu
            viewKey="by-date"
            rows={byDateExportRows}
            columns={[
              { key: 'period', header: tByDate('columns.period') },
              { key: 'cost', header: tByDate('columns.cost') },
              { key: 'total', header: tByDate('columns.total') },
              { key: 'input', header: tByDate('columns.input') },
              { key: 'output', header: tByDate('columns.output') },
              { key: 'cacheRead', header: tByDate('columns.cacheRead') },
              { key: 'cacheWrite', header: tByDate('columns.cacheWrite') },
              { key: 'messages', header: tByDate('columns.messages') },
              { key: 'sessions', header: tByDate('columns.sessions') },
              { key: 'projects', header: tByDate('columns.projects') },
            ]}
          />
        )}
      </>
    );
  };

  return (
    <AppShell onAction={handleSidebarAction} topbarActions={renderTopbarActions}>
      {(view) => (
        <div className="space-y-4">
          <Dropzone
            status={events.status}
            progress={events.progress}
            stats={events.stats}
            error={events.error}
            onFiles={events.addFiles}
            onClear={events.clear}
            reloadPickerRequest={reloadPickerRequest}
          />
          {view === 'overview' && <OverviewView aggregation={aggregation} hasData={hasData} />}
          {view === 'projects' && (
            <ProjectsView
              aggregation={aggregation}
              hasData={hasData}
              onVisibleRowsChange={setVisibleProjects}
            />
          )}
          {view === 'sessions' && (
            <SessionsView
              aggregation={aggregation}
              hasData={hasData}
              onVisibleRowsChange={setVisibleSessions}
            />
          )}
          {view === 'timeline' && <TimelineView aggregation={aggregation} hasData={hasData} />}
          {view === 'by-date' && (
            <ByDateView
              aggregation={aggregation}
              hasData={hasData}
              onVisibleRowsChange={setVisibleByDate}
            />
          )}
          {view !== 'overview' &&
            view !== 'projects' &&
            view !== 'timeline' &&
            view !== 'sessions' &&
            view !== 'by-date' && (
              <ViewPlaceholder view={view} />
            )}
          <PricingEditor
            open={pricingOpen}
            onOpenChange={setPricingOpen}
            pricing={pricing.pricing}
            onSave={pricing.setPricing}
          />
          <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{tActions('clearDialog.title')}</DialogTitle>
                <DialogDescription>{tActions('clearDialog.description')}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="border-t border-border">
                <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                  {tActions('clearDialog.cancel')}
                </Button>
                <Button onClick={handleClearConfirm}>
                  {tActions('clearDialog.confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
