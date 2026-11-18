import { describe, expect, it } from 'vitest';

import {
  buildCanonicalUrl,
  buildPageTitle,
  buildRobotsTxt,
  buildSitemapXml,
} from '../../src/lib/seo';

const site = new URL('https://example.com');

describe('buildPageTitle', () => {
  it('appends the site name', () => {
    expect(buildPageTitle('Projects', 'Jane Doe')).toBe('Projects · Jane Doe');
  });

  it('falls back to the site name alone', () => {
    expect(buildPageTitle(undefined, 'Jane Doe')).toBe('Jane Doe');
    expect(buildPageTitle('   ', 'Jane Doe')).toBe('Jane Doe');
  });
});

describe('buildCanonicalUrl', () => {
  it('builds an absolute URL in canonical form', () => {
    expect(buildCanonicalUrl('/about/', site)).toBe('https://example.com/about');
    expect(buildCanonicalUrl('/', site)).toBe('https://example.com/');
    expect(buildCanonicalUrl('/projects/x.html', site)).toBe('https://example.com/projects/x');
  });
});

describe('buildSitemapXml', () => {
  it('lists each unique page once, sorted', () => {
    const xml = buildSitemapXml(['/about', '/', '/about/'], site);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml.match(/<loc>https:\/\/example\.com\/about<\/loc>/g)).toHaveLength(1);
    expect(xml.indexOf('https://example.com/<')).toBeLessThan(xml.indexOf('/about<'));
  });

  it('escapes XML special characters', () => {
    expect(buildSitemapXml(['/a&b'], site)).toContain('/a&amp;b</loc>');
  });
});

describe('buildRobotsTxt', () => {
  it('points crawlers to the sitemap', () => {
    expect(buildRobotsTxt(site)).toContain('Sitemap: https://example.com/sitemap.xml');
  });
});
