'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/presentation/components/layout/app-shell';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Dropzone } from '@/presentation/components/data/dropzone';
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

export default function HomePage() {
  const tActions = useTranslations('sidebarActions');
  const pricing = usePricing();
  const events = useEvents();
  const filters = useFilters();
  const aggregation = useAggregation(events.events, pricing.pricing, filters.range);
  const hasData = events.events.length > 0;
  const [pricingOpen, setPricingOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [reloadPickerRequest, setReloadPickerRequest] = useState(0);

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

  return (
    <AppShell
      onAction={handleSidebarAction}
      topbarActions={hasData ? <DateRangeFilter filters={filters} /> : null}
    >
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
