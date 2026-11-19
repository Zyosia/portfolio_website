import { expect, test } from '@playwright/test';

test.describe('language switch', () => {
  test('switches to the same page in French and back', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    const switcher = page.getByRole('list', { name: 'Language' });
    await expect(switcher.getByRole('link', { name: 'EN English' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await switcher.getByRole('link', { name: 'FR Français' }).click();

    await expect(page).toHaveURL(/\/fr\/about$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('À propos');

    await page
      .getByRole('list', { name: 'Langue' })
      .getByRole('link', { name: 'EN English' })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
  });

  test('keeps the project when switching on a detail page', async ({ page }) => {
    await page.goto('/projects/plant-disease-detection');
    await page.getByRole('link', { name: 'FR Français' }).click();
    await expect(page).toHaveURL(/\/fr\/projects\/plant-disease-detection$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Détection de maladies végétales',
    );
  });

  test('French pages link to French pages', async ({ page, isMobile }) => {
    await page.goto('/fr');
    if (isMobile) await page.locator('header summary').click();
    await page
      .getByRole('navigation', { name: 'Principale' })
      .getByRole('link', { name: 'projets', exact: true })
      .click();
    await expect(page).toHaveURL(/\/fr\/projects$/);

    await page.getByRole('article').first().getByRole('link').click();
    await expect(page).toHaveURL(/\/fr\/projects\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'Technologies' })).toBeVisible();
  });

  test('declares alternate languages for search engines', async ({ page }) => {
    await page.goto('/fr/cv');
    const alternates = page.locator('head link[rel="alternate"][hreflang]');
    await expect(alternates).toHaveCount(3);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /\/cv$/);
    await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute('href', /\/fr\/cv$/);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', /\/cv$/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_FR');
  });

  test('French CV offers the French PDF first', async ({ page }) => {
    await page.goto('/fr/cv');
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
    await page.goto('/fr/contact');
    await page.getByRole('button', { name: 'Envoyer le message' }).click();
    await expect(page.getByLabel('Nom')).toHaveAccessibleDescription('Veuillez saisir votre nom.');
    await expect(page.getByText('Veuillez corriger les champs signalés.')).toBeVisible();
  });

  test('theme toggle label is translated', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/fr');
    await expect(page.getByRole('button', { name: 'Passer au thème sombre' })).toBeVisible();
  });
});
