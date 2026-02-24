import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

/**
 * Authentication Fixture
 *
 * Extends Playwright's base test with authentication capabilities.
 * Automatically handles login state management across tests.
 *
 * - `loginPage`: A LoginPage page-object instance for manual login flows
 * - `authenticatedPage`: A Page that is pre-authenticated as the system admin
 *   (requires TEST_SYSTEM_ADMIN_EMAIL and TEST_SYSTEM_ADMIN_PASSWORD env vars)
 */

export const test = base.extend<{
  loginPage: LoginPage;
  authenticatedPage: Page;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  authenticatedPage: async ({ page }, use) => {
    const email = process.env.TEST_SYSTEM_ADMIN_EMAIL;
    const password = process.env.TEST_SYSTEM_ADMIN_PASSWORD;

    if (email && password) {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(email, password);
      await loginPage.expectLoginSuccess();
    }

    await use(page);

    // Cleanup: clear auth state after test
    await page.context().clearCookies();
  },
});

export { expect };
