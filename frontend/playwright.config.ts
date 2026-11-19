import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env.CI);

// Tests run against the production build (`astro preview`), not the dev server,
// so they exercise exactly what is deployed. `pnpm test:e2e` builds first.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    // Decorative animations off by default, so audits (axe, screenshots) see the final
    // state; tests/e2e/motion.spec.ts opts back in to cover them.
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm preview --host 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
  },
});
