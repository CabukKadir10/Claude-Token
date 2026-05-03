import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE } from './locales';
import { MESSAGES } from './messages';

/**
 * Server-side request configuration for next-intl.
 *
 * The locale here is intentionally fixed to `DEFAULT_LOCALE` because we run
 * a single-page client-only app — there is no URL routing per locale, no
 * server cookie. Once the client mounts, `LocaleProvider` reads the user's
 * preference from `localStorage` and re-wraps the tree with the correct
 * messages, so the server-rendered HTML is always in the default language.
 */
export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: MESSAGES[DEFAULT_LOCALE],
  timeZone: 'UTC',
}));
