import type { Locale } from './locales';
import tr from './locales/tr.json';
import en from './locales/en.json';

/**
 * Both dictionaries are imported statically and shipped together.
 * They're tiny (a few KB each) and avoiding async import keeps the language
 * switcher instant — no flash of untranslated UI when toggling.
 */
export const MESSAGES: Readonly<Record<Locale, typeof tr>> = { tr, en };

/** TS check: each locale's dictionary must have the same shape as TR. */
type _ShapeCheck = (typeof en) extends typeof tr ? true : false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _shapeCheck: _ShapeCheck = true;
