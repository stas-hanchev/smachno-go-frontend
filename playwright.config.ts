import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    locale: 'uk-UA',
    timezoneId: 'Europe/Kyiv',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile',
      use: { viewport: { width: 412, height: 917 }, isMobile: true, hasTouch: true },
    },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
});
