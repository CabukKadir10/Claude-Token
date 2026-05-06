'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ModelTier } from '@/domain/value-objects/model-tier';
import { MODEL_TIERS } from '@/domain/value-objects/model-tier';
import type { Pricing } from '@/domain/value-objects/pricing';
import { DEFAULT_PRICING, clonePricing } from '@/domain/value-objects/pricing';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Input } from '@/presentation/components/ui/input';

interface PricingEditorProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly pricing: Pricing;
  readonly onSave: (next: Pricing) => void;
}

type EditableField = 'in' | 'out' | 'cr' | 'cw5m' | 'cw1h';
type DraftRow = Record<EditableField, string>;
type DraftTable = Record<ModelTier, DraftRow>;
type MutablePricing = Record<ModelTier, Record<EditableField, number> & { label: string }>;

const FIELDS: ReadonlyArray<EditableField> = ['in', 'out', 'cr', 'cw5m', 'cw1h'];

export function PricingEditor({ open, onOpenChange, pricing, onSave }: PricingEditorProps) {
  const t = useTranslations('pricingEditor');
  const [draft, setDraft] = useState<DraftTable>(() => toDraftTable(pricing));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(toDraftTable(pricing));
    setError(null);
  }, [open, pricing]);

  const rows = useMemo(
    () =>
      MODEL_TIERS.map((tier) => ({
        tier,
        label: pricing[tier].label,
      })),
    [pricing],
  );

  const fieldLabels = useMemo(
    () =>
      Object.fromEntries(FIELDS.map((field) => [field, t(`columns.${field}`)])) as Record<EditableField, string>,
    [t],
  );

  const onChange = (tier: ModelTier, field: EditableField, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value,
      },
    }));
    if (error) setError(null);
  };

  const onResetTier = (tier: ModelTier) => {
    setDraft((prev) => ({
      ...prev,
      [tier]: {
        in: String(DEFAULT_PRICING[tier].in),
        out: String(DEFAULT_PRICING[tier].out),
        cr: String(DEFAULT_PRICING[tier].cr),
        cw5m: String(DEFAULT_PRICING[tier].cw5m),
        cw1h: String(DEFAULT_PRICING[tier].cw1h),
      },
    }));
    if (error) setError(null);
  };

  const handleSave = () => {
    const parsed = parseDraft(draft);
    if (!parsed.ok) {
      setError(t('errors.invalidNumbers'));
      return;
    }
    const next = clonePricing(pricing) as MutablePricing;
    for (const tier of MODEL_TIERS) {
      for (const field of FIELDS) next[tier][field] = parsed.value[tier][field];
    }
    onSave(next);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 pb-2">
          {error && (
            <div className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-medium">{t('columns.tier')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('columns.in')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('columns.out')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('columns.cr')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('columns.cw5m')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('columns.cw1h')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ tier, label }) => (
                  <tr key={tier} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5 text-foreground">
                      <p className="font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{tier}</p>
                    </td>
                    {FIELDS.map((field) => (
                      <td key={`${tier}:${field}`} className="px-2 py-2.5">
                        <Input
                          value={draft[tier][field]}
                          type="number"
                          min={0}
                          step="any"
                          className="h-8 text-right font-mono text-xs tabular-nums"
                          onChange={(event) => onChange(tier, field, event.target.value)}
                          aria-label={`${label} ${fieldLabels[field]}`}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-right">
                      <Button variant="ghost" size="sm" onClick={() => onResetTier(tier)}>
                        {t('resetTier')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toDraftTable(pricing: Pricing): DraftTable {
  const out = {} as DraftTable;
  for (const tier of MODEL_TIERS) {
    out[tier] = {
      in: String(pricing[tier].in),
      out: String(pricing[tier].out),
      cr: String(pricing[tier].cr),
      cw5m: String(pricing[tier].cw5m),
      cw1h: String(pricing[tier].cw1h),
    };
  }
  return out;
}

function parseDraft(draft: DraftTable): { ok: true; value: Record<ModelTier, Record<EditableField, number>> } | { ok: false } {
  const parsed = {} as Record<ModelTier, Record<EditableField, number>>;
  for (const tier of MODEL_TIERS) {
    const row = {} as Record<EditableField, number>;
    for (const field of FIELDS) {
      const n = Number(draft[tier][field]);
      if (!Number.isFinite(n) || n < 0) return { ok: false };
      row[field] = n;
    }
    parsed[tier] = row;
  }
  return { ok: true, value: parsed };
}
