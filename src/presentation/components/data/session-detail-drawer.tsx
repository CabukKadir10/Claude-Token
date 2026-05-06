'use client';

import { useTranslations } from 'next-intl';
import type { Session } from '@/domain/entities/session';
import { totalTokens } from '@/domain/value-objects/tokens';
import { Button } from '@/presentation/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/presentation/components/ui/drawer';
import { useLocale } from '@/presentation/components/layout/locale-provider';
import { fmtCost } from '@/shared/utils/format-cost';
import { fmtCompact } from '@/shared/utils/format-number';
import { formatDuration } from '@/shared/utils/format-date';
import { shortSid } from '@/shared/utils/short-sid';

interface SessionDetailDrawerProps {
  readonly session: Session | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SessionDetailDrawer({ session, open, onOpenChange }: SessionDetailDrawerProps) {
  const t = useTranslations('sessions');
  const { locale } = useLocale();

  const durationMs =
    session && session.firstTs !== null && session.lastTs !== null
      ? Math.max(0, session.lastTs - session.firstTs)
      : null;

  const formatTs = (ts: number | null) => {
    if (ts === null) return t('unknown');
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(ts);
  };

  const title = session ? `${t('detail.title')} · ${shortSid(session.id)}` : t('detail.title');
  const subtitle = session ? session.projectName : t('detail.emptyDescription');

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto flex max-h-[86vh] w-full max-w-5xl flex-col">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{subtitle}</DrawerDescription>
        </DrawerHeader>

        {session ? (
          <div className="grid gap-5 overflow-y-auto px-4 pb-2 md:grid-cols-2">
            <section className="rounded-lg border border-border p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">{t('detail.metaTitle')}</h3>
              <dl className="space-y-2 text-sm">
                <MetaRow label={t('detail.sessionId')} value={session.id} mono />
                <MetaRow label={t('detail.project')} value={session.projectName} />
                <MetaRow label={t('detail.firstTs')} value={formatTs(session.firstTs)} />
                <MetaRow label={t('detail.lastTs')} value={formatTs(session.lastTs)} />
                <MetaRow
                  label={t('detail.duration')}
                  value={durationMs === null ? t('unknown') : formatDuration(durationMs)}
                />
              </dl>
            </section>

            <section className="rounded-lg border border-border p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">{t('detail.kpisTitle')}</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <KpiCell label={t('columns.cost')} value={fmtCost(session.cost)} />
                <KpiCell label={t('columns.tokens')} value={fmtCompact(totalTokens(session.tokens))} />
                <KpiCell
                  label={t('columns.messages')}
                  value={session.messages.toLocaleString(locale)}
                  className="col-span-2"
                />
              </dl>
            </section>

            <section className="md:col-span-2 rounded-lg border border-border">
              <div className="px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">{t('detail.modelsTitle')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2 font-medium">{t('detail.model')}</th>
                      <th className="px-4 py-2 text-right font-medium">{t('columns.messages')}</th>
                      <th className="px-4 py-2 text-right font-medium">{t('columns.tokens')}</th>
                      <th className="px-4 py-2 text-right font-medium">{t('columns.cost')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.models.map((model) => (
                      <tr key={`${session.id}:${model.tier}`} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 text-foreground">{model.modelLabel || t('unknown')}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                          {model.messages.toLocaleString(locale)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                          {fmtCompact(totalTokens(model.tokens))}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">
                          {fmtCost(model.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <div className="px-4 pb-4 text-sm text-muted-foreground">{t('detail.emptyDescription')}</div>
        )}

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{t('detail.close')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface MetaRowProps {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}

function MetaRow({ label, value, mono = false }: MetaRowProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? 'max-w-[60%] break-all font-mono text-xs text-foreground' : 'text-right text-foreground'}>
        {value}
      </dd>
    </div>
  );
}

interface KpiCellProps {
  readonly label: string;
  readonly value: string;
  readonly className?: string;
}

function KpiCell({ label, value, className }: KpiCellProps) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold text-foreground">{value}</dd>
    </div>
  );
}
