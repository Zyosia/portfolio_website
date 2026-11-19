import { expect, test } from '@playwright/test';

/*
 * Decorative animations: they must never hide or alter content, and must be skipped when
 * the visitor prefers reduced motion (the default of the other specs).
 */

test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('home pitch is typed out, while the full text stays in the page', async ({ page }) => {
    await page.goto('/');
    const pitch = page.locator('[data-typewriter-text]');
    const fullText = (await pitch.textContent())?.trim() ?? '';
    expect(fullText.length).toBeGreaterThan(20);

    // The overlay types the text, then hands back to the real paragraph.
    const overlay = page.locator('[data-typewriter] [aria-hidden="true"]');
    await expect(overlay).toHaveCount(1);
    await expect(overlay).toHaveText(fullText, { timeout: 5_000 });
    await expect(overlay).toHaveCount(0, { timeout: 5_000 });
    await expect(pitch).not.toHaveClass(/text-transparent/);
  });

  test('pitch is typed once per session', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-typewriter] [aria-hidden="true"]')).toHaveCount(1);
    await page.goto('/about');
    await page.goto('/');
    await expect(page.locator('[data-typewriter-text]')).not.toHaveClass(/text-transparent/);
    await expect(page.locator('[data-typewriter] [aria-hidden="true"]')).toHaveCount(0);
  });

  test('sections are revealed when scrolled into view', async ({ page }) => {
    await page.goto('/cv');
    const last = page.locator('[data-reveal]').last();
    await expect(last).not.toHaveClass(/is-revealed/);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveClass(/is-revealed/);
    await expect(last).toHaveCSS('opacity', '1');
  });
});

test('reduced motion shows everything at once, without typing', async ({ page }) => {
  await page.goto('/cv');
  for (const element of await page.locator('[data-reveal]').all()) {
    await expect(element).toHaveCSS('opacity', '1');
  }
  await page.goto('/');
  await expect(page.locator('[data-typewriter] [aria-hidden="true"]')).toHaveCount(0);
});

test('without JavaScript no content is hidden', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto('/cv');
  for (const element of await page.locator('[data-reveal]').all()) {
    await expect(element).toHaveCSS('opacity', '1');
  }
  await context.close();
});
