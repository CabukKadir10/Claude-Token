export const LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'tr';

export const LOCALE_LABELS: Readonly<Record<Locale, string>> = {
  tr: 'Türkçe',
  en: 'English',
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value !== null && value !== undefined && (LOCALES as ReadonlyArray<string>).includes(value);
}
