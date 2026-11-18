import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext } from '@playwright/test';

/*
 * Site-wide audits run against the production build: every page listed in the sitemap is
 * crawled for broken internal links, SEO metadata and accessibility in the dark theme.
 * Desktop only: these checks do not depend on the viewport.
 */

test.skip(({ isMobile }) => isMobile, 'Site-wide audits run once, on desktop.');

async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get('/sitemap.xml')).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1] ?? '').pathname);
}

test('sitemap pages and every internal link or asset they reference respond 200', async ({
  page,
  request,
  baseURL,
}) => {
  const pages = await sitemapPaths(request);
  expect(pages.length).toBeGreaterThanOrEqual(6);

  const origin = new URL(baseURL ?? '').origin;
  const targets = new Set<string>(['/robots.txt', '/favicon.svg', '/cv.pdf']);

  for (const path of pages) {
    await page.goto(path);
    const urls = await page
      .locator('a[href], link[href], img[src], script[src], source[srcset]')
      .evaluateAll((elements) =>
        elements.flatMap((element) => {
          const value =
            element.getAttribute('href') ??
            element.getAttribute('src') ??
            element.getAttribute('srcset') ??
            '';
          // srcset: "url 400w, url 800w"
          return value.split(',').map((candidate) => candidate.trim().split(/\s+/)[0] ?? '');
        }),
      );
    for (const url of urls) {
      const absolute = new URL(url, `${origin}${path}`);
      if (absolute.origin === origin) targets.add(absolute.pathname);
    }
  }

  const broken: string[] = [];
  for (const target of targets) {
    const response = await request.get(target);
    if (response.status() !== 200) broken.push(`${target} → ${response.status()}`);
  }
  expect(broken).toEqual([]);
});

test('every page has complete and unique SEO metadata', async ({ page, request }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const path of await sitemapPaths(request)) {
    await page.goto(path);
    const head = page.locator('head');

    const title = await page.title();
    const description =
      (await head.locator('meta[name="description"]').getAttribute('content')) ?? '';
    const canonical = await head.locator('link[rel="canonical"]').getAttribute('href');

    expect.soft(title, `${path}: title`).not.toBe('');
    expect.soft(titles.has(title), `${path}: duplicate title "${title}"`).toBe(false);
    expect.soft(description.length, `${path}: description length`).toBeGreaterThanOrEqual(50);
    expect.soft(description.length, `${path}: description length`).toBeLessThanOrEqual(160);
    expect.soft(descriptions.has(description), `${path}: duplicate description`).toBe(false);
    expect
      .soft(canonical, `${path}: canonical`)
      .toMatch(new RegExp(`${path === '/' ? '/' : path}$`));
    expect.soft(await page.locator('html').getAttribute('lang'), `${path}: lang`).toBe('en');
    await expect.soft(page.locator('h1'), `${path}: one h1`).toHaveCount(1);
    for (const property of ['og:title', 'og:description', 'og:url', 'og:type']) {
      await expect
        .soft(head.locator(`meta[property="${property}"]`), `${path}: ${property}`)
        .toHaveCount(1);
    }
    await expect.soft(head.locator('meta[name="robots"]'), `${path}: indexable`).toHaveCount(0);

    titles.add(title);
    descriptions.add(description);
  }
});

test('every page has no accessibility violations in the dark theme', async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  const violations: string[] = [];

  for (const path of await sitemapPaths(request)) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    violations.push(...results.violations.map((violation) => `${path}: ${violation.id}`));
  }

  await context.close();
  expect(violations).toEqual([]);
});
