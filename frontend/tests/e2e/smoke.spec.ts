import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/', heading: /.+/ },
  { path: '/projects', heading: 'Projects' },
  { path: '/about', heading: 'About' },
  { path: '/cv', heading: 'Curriculum vitae' },
  { path: '/contact', heading: 'Contact' },
  { path: '/projects/rust-ai-competition-platform', heading: /.+/ },
  { path: '/fr', heading: /.+/ },
  { path: '/fr/projects', heading: 'Projets' },
  { path: '/fr/about', heading: 'À propos' },
  { path: '/fr/cv', heading: 'Curriculum vitae' },
  { path: '/fr/contact', heading: 'Contact' },
] as const;

test.describe('every page', () => {
  for (const { path, heading } of PAGES) {
    test(`${path} renders with one h1, a title and no a11y violations`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('unknown routes serve the 404 page', async ({ page }) => {
    const response = await page.goto('/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
  });
});

test.describe('navigation', () => {
  test('reaches every section from the header and marks the current page', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    for (const label of ['projects', 'about', 'cv', 'contact']) {
      if (isMobile) await page.locator('header summary').click();
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: label, exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`/${label}$`));
      await expect(page.locator('a[aria-current="page"]').first()).toHaveAttribute(
        'href',
        `/${label}`,
      );
    }
  });

  test('skip link moves focus to the main content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is a desktop concern.');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('theme', () => {
  test('follows the system preference by default', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await context.close();
  });

  test('toggle switches the theme and remembers the choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  });
});

test.describe('SEO files', () => {
  test('robots.txt points to the sitemap', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  });

  test('sitemap lists the main pages', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    for (const path of ['/projects', '/about', '/cv', '/contact']) {
      expect(body).toContain(`${path}</loc>`);
    }
  });
});
