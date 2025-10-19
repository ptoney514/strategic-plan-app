import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

/**
 * Authentication Fixture
 *
 * Extends Playwright's base test with authentication capabilities.
 * Automatically handles login state management across tests.
 */

export const test = base.extend<{
  loginPage: LoginPage;
  authenticatedPage: any;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // TODO: Add authentication logic here
    // For now, pass through the page
    // We'll implement this once we understand the auth flow better
    await use(page);
  },
});

export { expect };
