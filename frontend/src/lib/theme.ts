import { clientStrings } from './i18n/client-strings';
import type { Locale } from './i18n/locales';

/** Colour themes supported by the site. */
export type Theme = 'light' | 'dark';

/** localStorage key holding an explicit user choice. Absent = follow the system. */
export const THEME_STORAGE_KEY = 'theme';

/** Narrows an untrusted value (localStorage, data attribute) to a theme, or `null`. */
export function parseTheme(value: unknown): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

/** An explicit user choice wins; otherwise the operating system preference applies. */
export function resolveTheme(stored: Theme | null, systemPrefersDark: boolean): Theme {
  return stored ?? (systemPrefersDark ? 'dark' : 'light');
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/** Accessible label of the toggle: it names the action, not the current state. */
export function toggleLabel(current: Theme, locale: Locale): string {
  return clientStrings(locale).theme.switchTo(oppositeTheme(current));
}
