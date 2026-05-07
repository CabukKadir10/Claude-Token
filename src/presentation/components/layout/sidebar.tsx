'use client';

import {
  LayoutDashboard,
  FolderTree,
  ListTodo,
  TrendingUp,
  CalendarDays,
  DollarSign,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/utils/cn';

export type ViewId = 'overview' | 'projects' | 'sessions' | 'timeline' | 'by-date';
export type ActionId = 'pricing' | 'reload' | 'clear';

interface SidebarProps {
  activeView?: ViewId;
  onNavigate?: (id: ViewId) => void;
  onAction?: (id: ActionId) => void;
}

const VIEW_ITEMS: ReadonlyArray<{ id: ViewId; key: string; icon: LucideIcon }> = [
  { id: 'overview', key: 'overview', icon: LayoutDashboard },
  { id: 'projects', key: 'projects', icon: FolderTree },
  { id: 'sessions', key: 'sessions', icon: ListTodo },
  { id: 'timeline', key: 'timeline', icon: TrendingUp },
  { id: 'by-date', key: 'byDate', icon: CalendarDays },
];

const ACTION_ITEMS: ReadonlyArray<{ id: ActionId; key: string; icon: LucideIcon }> = [
  { id: 'pricing', key: 'pricing', icon: DollarSign },
  { id: 'reload', key: 'reload', icon: RefreshCw },
  { id: 'clear', key: 'clear', icon: Trash2 },
];

export function Sidebar({ activeView = 'overview', onNavigate, onAction }: SidebarProps) {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-4">
        <p className="font-mono text-sm font-semibold text-foreground">{tCommon('appBrand')}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{tCommon('appTagline')}</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        <NavGroup label={tNav('viewsLabel')}>
          {VIEW_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              label={tNav(item.key)}
              icon={item.icon}
              active={item.id === activeView}
              onClick={() => onNavigate?.(item.id)}
            />
          ))}
        </NavGroup>

        <NavGroup label={tNav('settingsLabel')}>
          {ACTION_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              label={tNav(item.key)}
              icon={item.icon}
              onClick={() => onAction?.(item.id)}
            />
          ))}
        </NavGroup>
      </nav>

      <div className="border-t border-border px-4 py-3 text-[10px] leading-relaxed text-muted-foreground">
        <p>{tCommon('footerNote1')}</p>
        <p>{tCommon('footerNote2')}</p>
      </div>
    </aside>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function NavButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <Icon
          className={cn('h-4 w-4', active ? 'text-accent' : 'text-muted-foreground')}
          aria-hidden
        />
        <span>{label}</span>
      </button>
    </li>
  );
}
