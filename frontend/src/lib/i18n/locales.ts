import { normalizePath } from '../paths';

/*
 * Supported languages and URL scheme. English, the default, lives at the root (`/about`);
 * every other locale is prefixed (`/fr/about`). Page slugs are identical in every locale,
 * so switching language only changes the prefix.
 */

export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleMeta {
  /** Name of the language in that language, for the switcher. */
  readonly nativeName: string;
  /** Short label shown in the switcher. */
  readonly shortLabel: string;
  /** Open Graph locale. */
  readonly ogLocale: string;
}

export const LOCALE_META: Readonly<Record<Locale, LocaleMeta>> = {
  en: { nativeName: 'English', shortLabel: 'EN', ogLocale: 'en_US' },
  fr: { nativeName: 'Français', shortLabel: 'FR', ogLocale: 'fr_FR' },
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

/** Narrows an untrusted value (e.g. `<html lang>`) to a supported locale. */
export function parseLocale(value: unknown): Locale {
  if (typeof value !== 'string') return DEFAULT_LOCALE;
  const language = value.toLowerCase().split('-')[0];
  return isLocale(language) ? language : DEFAULT_LOCALE;
}

function prefixOf(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/** Locale of a URL pathname: `/fr/about` → `fr`, `/about` → `en`. */
export function localeFromPath(pathname: string): Locale {
  const first = normalizePath(pathname).split('/')[1];
  return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}

/** Pathname without its locale prefix: `/fr/about` → `/about`, `/fr` → `/`. */
export function stripLocale(pathname: string): string {
  const path = normalizePath(pathname);
  const locale = localeFromPath(path);
  if (locale === DEFAULT_LOCALE) return path;
  return normalizePath(path.slice(prefixOf(locale).length));
}

/** Locale-independent path → URL path in `locale`: `/about` → `/fr/about`, `/` → `/fr`. */
export function localizePath(path: string, locale: Locale): string {
  const base = normalizePath(path);
  const prefix = prefixOf(locale);
  if (!prefix) return base;
  return base === '/' ? prefix : `${prefix}${base}`;
}

/** The same page in another locale. */
export function alternatePath(pathname: string, target: Locale): string {
  return localizePath(stripLocale(pathname), target);
}
