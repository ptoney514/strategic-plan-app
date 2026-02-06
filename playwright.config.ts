import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const DISTRICT_ADMIN_STATE = path.join('e2e', '.auth', 'district-admin.json');
const SYSTEM_ADMIN_STATE = path.join('e2e', '.auth', 'system-admin.json');

/**
 * Playwright Configuration for Strategic Plan Builder
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Global setup — authenticates test users and saves storageState */
  globalSetup: './e2e/global-setup.ts',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: process.env.CI ? 'github' : 'html',

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5174',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Use domcontentloaded instead of load — vercel dev can be slow with sub-resources */
    navigationTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Pre-authenticated project for district admin tests
    {
      name: 'chromium-district-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: DISTRICT_ADMIN_STATE,
      },
    },

    // Pre-authenticated project for system admin tests
    {
      name: 'chromium-system-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: SYSTEM_ADMIN_STATE,
      },
    },

    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
