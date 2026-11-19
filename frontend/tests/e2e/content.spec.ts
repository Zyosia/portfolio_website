import { expect, test } from '@playwright/test';

test.describe('projects', () => {
  test('home page features projects linking to their detail page', async ({ page }) => {
    await page.goto('/');
    const featured = page.getByRole('region', { name: /Featured projects/ });
    const firstCard = featured.getByRole('article').first();
    const title = await firstCard.getByRole('heading').innerText();

    await firstCard.getByRole('link').click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByRole('heading', { name: 'Tech stack' })).toBeVisible();
  });

  test('tag filter shows matching projects only and is shareable', async ({ page }) => {
    await page.goto('/projects');
    const cards = page.locator('[data-project-tags]');
    const total = await cards.count();
    const filter = page.getByRole('group', { name: 'Filter projects by tag' });

    const tagButton = filter.getByRole('button').nth(1);
    const tag = await tagButton.getAttribute('data-tag');
    await tagButton.click();

    await expect(tagButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(new RegExp(`\\?tag=${tag ?? ''}$`));
    const visible = cards.filter({ visible: true });
    await expect(page.getByRole('status')).toHaveText(/^Showing \d+ projects? tagged /);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute('data-project-tags', new RegExp(`\\b${tag ?? ''}\\b`));
    }

    await page.reload();
    await expect(tagButton).toHaveAttribute('aria-pressed', 'true');

    await filter.getByRole('button', { name: /^All/ }).click();
    await expect(cards.filter({ visible: true })).toHaveCount(total);
    await expect(page).toHaveURL(/\/projects$/);
  });

  test('without JavaScript every project is listed and the filter is hidden', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/projects?tag=ai');
    await expect(page.getByRole('group', { name: 'Filter projects by tag' })).toBeHidden();
    await expect(page.locator('[data-project-tags]').first()).toBeVisible();
    await context.close();
  });
});

test.describe('CV', () => {
  test('offers the PDF download', async ({ page, request }) => {
    await page.goto('/cv');
    const link = page.getByRole('link', { name: /^Download PDF/ });
    await expect(link).toHaveAttribute('href', '/cv.pdf');

    const pdf = await request.get('/cv.pdf');
    expect(pdf.status()).toBe(200);
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  });

  test('print view hides the site chrome', async ({ page }) => {
    await page.goto('/cv');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('body > header')).toBeHidden();
    await expect(page.locator('body > footer')).toBeHidden();
    await expect(page.getByRole('link', { name: /^Download PDF/ })).toBeHidden();
    await expect(page.getByRole('heading', { name: /Experience/ })).toBeVisible();
  });
});
