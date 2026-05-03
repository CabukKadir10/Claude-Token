'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sidebar, type ViewId, type ActionId } from './sidebar';
import { Topbar } from './topbar';

interface AppShellProps {
  initialView?: ViewId;
  onAction?: (id: ActionId) => void;
  /** Optional content rendered in the topbar's action slot (e.g. global filters). */
  topbarActions?: React.ReactNode;
  children: (active: ViewId) => React.ReactNode;
}

const VIEW_KEY: Record<ViewId, string> = {
  overview: 'overview',
  projects: 'projects',
  sessions: 'sessions',
  timeline: 'timeline',
  'by-date': 'byDate',
};

/**
 * Top-level shell: sticky sidebar on the left, sticky topbar across the top,
 * scrollable main content. Active view is local state — Step 7+ will lift to
 * a route or URL param if/when we add deep-linking.
 */
export function AppShell({
  initialView = 'overview',
  onAction,
  topbarActions,
  children,
}: AppShellProps) {
  const tViews = useTranslations('views');
  const [view, setView] = useState<ViewId>(initialView);
  const key = VIEW_KEY[view];

  return (
    <div className="flex min-h-screen">
      <Sidebar activeView={view} onNavigate={setView} onAction={onAction} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={tViews(`${key}.title`)}
          subtitle={tViews(`${key}.subtitle`)}
          actions={topbarActions}
        />
        <main className="flex-1 px-6 py-6">{children(view)}</main>
      </div>
    </div>
  );
}
