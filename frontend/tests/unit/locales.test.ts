import { describe, expect, it } from 'vitest';

import {
  alternatePath,
  localeFromPath,
  localizePath,
  parseLocale,
  stripLocale,
} from '../../src/lib/i18n/locales';

describe('parseLocale', () => {
  it.each([
    ['en', 'en'],
    ['fr', 'fr'],
    ['fr-FR', 'fr'],
    ['FR', 'fr'],
    ['de', 'en'],
    ['', 'en'],
    [undefined, 'en'],
  ] as const)('%j → %s', (value, expected) => {
    expect(parseLocale(value)).toBe(expected);
  });
});

describe('localeFromPath / stripLocale', () => {
  it.each([
    ['/', 'en', '/'],
    ['/about', 'en', '/about'],
    ['/fr', 'fr', '/'],
    ['/fr/', 'fr', '/'],
    ['/fr.html', 'fr', '/'],
    ['/fr/projects/my-app', 'fr', '/projects/my-app'],
    ['/fr/about.html', 'fr', '/about'],
    ['/en/about', 'en', '/en/about'],
    ['/french-food', 'en', '/french-food'],
  ] as const)('%s → %s %s', (pathname, locale, stripped) => {
    expect(localeFromPath(pathname)).toBe(locale);
    expect(stripLocale(pathname)).toBe(stripped);
  });
});

describe('localizePath', () => {
  it('keeps English at the root and prefixes French', () => {
    expect(localizePath('/', 'en')).toBe('/');
    expect(localizePath('/about', 'en')).toBe('/about');
    expect(localizePath('/', 'fr')).toBe('/fr');
    expect(localizePath('/projects/my-app', 'fr')).toBe('/fr/projects/my-app');
  });
});

describe('alternatePath', () => {
  it('points to the same page in the other language', () => {
    expect(alternatePath('/cv', 'fr')).toBe('/fr/cv');
    expect(alternatePath('/fr/cv', 'en')).toBe('/cv');
    expect(alternatePath('/fr', 'en')).toBe('/');
    expect(alternatePath('/fr/projects/x', 'fr')).toBe('/fr/projects/x');
  });
});
