'use client';

import { useEffect, useRef, useState } from 'react';
import { Languages, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import { useLocale } from './locale-provider';
import { LOCALE_LABELS } from '@/infrastructure/i18n/locales';
import { cn } from '@/shared/utils/cn';

export function LanguageSwitcher() {
  const t = useTranslations('topbar');
  const { locale, setLocale, locales } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('languageAria')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Languages className="h-4 w-4" aria-hidden />
      </Button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-md border border-border bg-card shadow-lg"
        >
          {locales.map((l) => (
            <li key={l} role="none">
              <button
                role="menuitemradio"
                aria-checked={locale === l}
                type="button"
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-sm transition-colors',
                  'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                  locale === l ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <span>{LOCALE_LABELS[l]}</span>
                {locale === l && <Check className="h-3.5 w-3.5 text-accent" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
