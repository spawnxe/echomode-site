import { defineConfig } from '@playwright/test';

// Must match astro.config.mjs (SITE_BASE) so `astro preview` serves at the same path.
const base = (process.env.SITE_BASE ?? '/echomode-site').replace(/\/$/, '');
const port = 4321;
const url = `http://localhost:${port}${base}/`;

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: url,
    trace: 'retain-on-failure',
    // Locally you may point at an existing Chromium (PW_CHROMIUM=/path/to/chrome); CI installs its own.
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } }, testIgnore: /mobile/ },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, testMatch: /mobile/ },
  ],
  webServer: {
    command: `node scripts/serve.mjs`,
    env: { PORT: String(port), SITE_BASE: base },
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
