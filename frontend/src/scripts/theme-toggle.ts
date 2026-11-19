import {
  THEME_STORAGE_KEY,
  oppositeTheme,
  parseTheme,
  resolveTheme,
  toggleLabel,
  type Theme,
} from '../lib/theme';
import { parseLocale } from '../lib/i18n/locales';

const locale = parseLocale(document.documentElement.lang);

const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function readStoredTheme(): Theme | null {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    // Storage can be unavailable (privacy mode, blocked cookies): fall back to the system.
    return null;
  }
}

function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The choice then only lasts for this page view, which is acceptable.
  }
}

function currentTheme(): Theme {
  return parseTheme(root.dataset['theme']) ?? resolveTheme(readStoredTheme(), systemDark.matches);
}

function applyTheme(theme: Theme, buttons: readonly HTMLButtonElement[]): void {
  root.dataset['theme'] = theme;
  for (const button of buttons) {
    button.setAttribute('aria-label', toggleLabel(theme, locale));
    button.title = toggleLabel(theme, locale);
  }
}

function initThemeToggle(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')];
  applyTheme(currentTheme(), buttons);

  for (const button of buttons) {
    button.hidden = false;
    button.addEventListener('click', () => {
      const next = oppositeTheme(currentTheme());
      storeTheme(next);
      applyTheme(next, buttons);
    });
  }

  // Follow live system changes, unless the visitor made an explicit choice.
  systemDark.addEventListener('change', (event) => {
    if (readStoredTheme() === null) applyTheme(event.matches ? 'dark' : 'light', buttons);
  });
}

initThemeToggle();
