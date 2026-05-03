'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';

const ORDER = ['light', 'dark', 'system'] as const;
type ThemeKey = (typeof ORDER)[number];

/**
 * Cycles through light → dark → system. Renders a placeholder before mount
 * to avoid the hydration mismatch warning that next-themes documents.
 */
export function ThemeToggle() {
  const t = useTranslations('topbar');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label={t('themeAria')} disabled>
        <Sun className="h-4 w-4 opacity-50" aria-hidden />
      </Button>
    );
  }

  const current = (ORDER.includes(theme as ThemeKey) ? theme : 'system') as ThemeKey;
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!;
  const Icon = current === 'dark' ? Moon : current === 'light' ? Sun : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('themeAria')}
      title={`${current} → ${next}`}
      onClick={() => setTheme(next)}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </Button>
  );
}
