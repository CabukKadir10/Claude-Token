'use client';

import { NextIntlClientProvider } from 'next-intl';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LOCALES, isLocale, type Locale } from '@/infrastructure/i18n/locales';
import { MESSAGES } from '@/infrastructure/i18n/messages';
import { localStorageStore } from '@/infrastructure/storage/local-storage-store';
import { LANGUAGE_STORAGE_KEY } from '@/shared/constants/storage-keys';

const LOCALE_COOKIE_KEY = 'claude-token-dashboard-locale';

function readLocaleFromCookie(): Locale | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE_KEY}=`));

  if (!match) return null;
  const value = decodeURIComponent(match.slice(`${LOCALE_COOKIE_KEY}=`.length));
  return isLocale(value) ? value : null;
}

function writeLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
}

interface LocaleContextValue {
  readonly locale: Locale;
  readonly setLocale: (next: Locale) => void;
  readonly locales: ReadonlyArray<Locale>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within <LocaleProvider>');
  return ctx;
}

interface LocaleProviderProps {
  /**
   * The locale used by the server-rendered tree. Always rendered first to
   * keep hydration consistent — `localStorage` is only consulted after mount.
   */
  serverLocale: string;
  children: React.ReactNode;
}

/**
 * Sits inside the server-rendered `NextIntlClientProvider` (set up in
 * `app/layout.tsx`). When the user picks a non-server locale via the
 * language switcher, we re-wrap children with a fresh provider that carries
 * the new dictionary — the new context overrides the parent for everything
 * below.
 */
export function LocaleProvider({ serverLocale, children }: LocaleProviderProps) {
  const initial: Locale = isLocale(serverLocale) ? serverLocale : 'tr';
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => {
    const saved = localStorageStore.get(LANGUAGE_STORAGE_KEY);
    const cookieLocale = readLocaleFromCookie();
    const resolved = isLocale(saved) ? saved : cookieLocale;

    if (resolved && resolved !== initial) {
      setLocaleState(resolved);
      document.documentElement.lang = resolved;
    }
  }, [initial]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    localStorageStore.set(LANGUAGE_STORAGE_KEY, next);
    writeLocaleCookie(next);
  }, []);

  const value: LocaleContextValue = { locale, setLocale, locales: LOCALES };

  // When the active locale matches the server locale, the parent provider
  // already carries the right dictionary — no need to re-wrap.
  if (locale === initial) {
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
  }

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
