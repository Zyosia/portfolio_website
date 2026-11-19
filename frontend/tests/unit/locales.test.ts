import { describe, expect, it } from 'vitest';

import {
  alternatePath,
  DEFAULT_LOCALE,
  localeFromPath,
  localizePath,
  parseLocale,
  stripLocale,
} from '../../src/lib/i18n/locales';

describe('DEFAULT_LOCALE', () => {
  it('is French, served at the root', () => {
    expect(DEFAULT_LOCALE).toBe('fr');
  });
});

describe('parseLocale', () => {
  it.each([
    ['en', 'en'],
    ['fr', 'fr'],
    ['en-GB', 'en'],
    ['EN', 'en'],
    ['fr-FR', 'fr'],
    ['de', 'fr'],
    ['', 'fr'],
    [undefined, 'fr'],
  ] as const)('%j → %s', (value, expected) => {
    expect(parseLocale(value)).toBe(expected);
  });
});

describe('localeFromPath / stripLocale', () => {
  it.each([
    ['/', 'fr', '/'],
    ['/about', 'fr', '/about'],
    ['/en', 'en', '/'],
    ['/en/', 'en', '/'],
    ['/en.html', 'en', '/'],
    ['/en/projects/my-app', 'en', '/projects/my-app'],
    ['/en/about.html', 'en', '/about'],
    ['/fr/about', 'fr', '/fr/about'],
    ['/english-food', 'fr', '/english-food'],
  ] as const)('%s → %s %s', (pathname, locale, stripped) => {
    expect(localeFromPath(pathname)).toBe(locale);
    expect(stripLocale(pathname)).toBe(stripped);
  });
});

describe('localizePath', () => {
  it('keeps French at the root and prefixes English', () => {
    expect(localizePath('/', 'fr')).toBe('/');
    expect(localizePath('/about', 'fr')).toBe('/about');
    expect(localizePath('/', 'en')).toBe('/en');
    expect(localizePath('/projects/my-app', 'en')).toBe('/en/projects/my-app');
  });
});

describe('alternatePath', () => {
  it('points to the same page in the other language', () => {
    expect(alternatePath('/cv', 'en')).toBe('/en/cv');
    expect(alternatePath('/en/cv', 'fr')).toBe('/cv');
    expect(alternatePath('/en', 'fr')).toBe('/');
    expect(alternatePath('/en/projects/x', 'en')).toBe('/en/projects/x');
  });
});
