import { expect, test } from '@playwright/test';

test.describe('language switch', () => {
  test('French is the default language, served at the root', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(
      page.getByRole('list', { name: 'Langue' }).getByRole('link', { name: 'FR Français' }),
    ).toHaveAttribute('aria-current', 'true');
  });

  test('switches to the same page in English and back', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('À propos');

    await page
      .getByRole('list', { name: 'Langue' })
      .getByRole('link', { name: 'EN English' })
      .click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');

    await page
      .getByRole('list', { name: 'Language' })
      .getByRole('link', { name: 'FR Français' })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page).not.toHaveURL(/\/en\//);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('À propos');
  });

  test('keeps the project when switching on a detail page', async ({ page }) => {
    await page.goto('/en/projects/plant-disease-detection');
    await page.getByRole('link', { name: 'FR Français' }).click();
    await expect(page).toHaveURL(/\/projects\/plant-disease-detection$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Détection de maladies végétales',
    );
  });

  test('English pages link to English pages', async ({ page, isMobile }) => {
    await page.goto('/en');
    if (isMobile) await page.locator('header summary').click();
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Projects', exact: true })
      .click();
    await expect(page).toHaveURL(/\/en\/projects$/);

    await page.getByRole('article').first().getByRole('link').click();
    await expect(page).toHaveURL(/\/en\/projects\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'Tech stack' })).toBeVisible();
  });

  test('declares alternate languages for search engines', async ({ page }) => {
    await page.goto('/en/cv');
    const alternates = page.locator('head link[rel="alternate"][hreflang]');
    await expect(alternates).toHaveCount(3);
    await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute('href', /[^n]\/cv$/);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /\/en\/cv$/);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', /[^n]\/cv$/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
  });

  test('French CV offers the French PDF first', async ({ page }) => {
    await page.goto('/cv');
    await expect(page.getByRole('link', { name: 'Télécharger le PDF' })).toHaveAttribute(
      'href',
      '/cv-fr.pdf',
    );
    await expect(page.getByRole('link', { name: 'English (PDF)' })).toHaveAttribute(
      'href',
      '/cv-en.pdf',
    );
  });

  test('contact form speaks French on French pages', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Envoyer le message' }).click();
    await expect(page.getByLabel('Nom')).toHaveAccessibleDescription('Veuillez saisir votre nom.');
    await expect(page.getByText('Veuillez corriger les champs signalés.')).toBeVisible();
  });

  test('theme toggle label is translated', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Passer au thème sombre' })).toBeVisible();
  });
});
