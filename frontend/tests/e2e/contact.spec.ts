import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

const API = '**/api/v1/contact';

async function fillValidForm(page: Page): Promise<void> {
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.org');
  await page.getByLabel('Subject').fill('Collaboration');
  await page.getByLabel('Message').fill('Hello, I would like to talk about a project.');
}

function json(route: Route, status: number, body: unknown): Promise<void> {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/contact');
});

test('sends a valid message and announces success', async ({ page }) => {
  let requestBody: unknown;
  await page.route(API, async (route) => {
    requestBody = route.request().postDataJSON();
    await json(route, 200, { status: 'sent' });
  });

  await fillValidForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Thank you' })).toBeVisible();
  expect(requestBody).toEqual({
    name: 'Ada Lovelace',
    email: 'ada@example.org',
    subject: 'Collaboration',
    message: 'Hello, I would like to talk about a project.',
    website: '',
  });
  await expect(page.getByLabel('Name')).toHaveValue('');
});

test('shows a busy state while sending', async ({ page }) => {
  let release: () => void = () => undefined;
  const pending = new Promise<void>((resolve) => (release = resolve));
  await page.route(API, async (route) => {
    await pending;
    await json(route, 200, { status: 'sent' });
  });

  await fillValidForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();

  const button = page.getByRole('button', { name: 'Sending…' });
  await expect(button).toBeDisabled();
  await expect(page.locator('form[data-contact-form]')).toHaveAttribute('aria-busy', 'true');
  release();
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
});

test('validates on the client without calling the API', async ({ page }) => {
  let called = false;
  await page.route(API, async (route) => {
    called = true;
    await json(route, 200, {});
  });

  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Send message' }).click();

  const name = page.getByLabel('Name');
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('Please enter your name.');
  await expect(page.getByLabel('Email')).toHaveAccessibleDescription(/valid email address/);
  await expect(page.getByText('Please correct the highlighted fields.')).toBeVisible();
  expect(called).toBe(false);

  // Fixing a field clears its error immediately.
  await name.fill('Ada');
  await expect(name).not.toHaveAttribute('aria-invalid');
});

test('explains rate limiting', async ({ page }) => {
  await page.route(API, (route) =>
    json(route, 429, { error: { code: 'rate_limited', message: 'Too many requests.' } }),
  );

  await fillValidForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByRole('status')).toContainText('sent several messages recently');
  await expect(page.getByLabel('Name')).toHaveValue('Ada Lovelace');
});

test('handles a server or network failure', async ({ page }) => {
  await page.route(API, (route) => route.abort('failed'));

  await fillValidForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByRole('status')).toContainText('connection failed');
});

test('error state has no accessibility violations', async ({ page }) => {
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('offers alternative contact links', async ({ page }) => {
  const elsewhere = page.getByRole('complementary', { name: 'Elsewhere' });
  await expect(elsewhere.getByRole('link', { name: /LinkedIn/ })).toBeVisible();
  await expect(elsewhere.getByRole('link', { name: /GitHub/ })).toBeVisible();
});
