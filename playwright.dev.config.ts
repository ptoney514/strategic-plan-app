import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for running tests against existing dev server
 * Use this when you already have a dev server running on port 5174
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer config - use existing server
});
