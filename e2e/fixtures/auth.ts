import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';
import path from 'path';

/** Directory for storing authenticated state files */
export const AUTH_DIR = path.join(import.meta.dirname, '..', '.auth');
export const DISTRICT_ADMIN_STATE = path.join(AUTH_DIR, 'district-admin.json');
export const SYSTEM_ADMIN_STATE = path.join(AUTH_DIR, 'system-admin.json');

/**
 * Authentication Fixture
 *
 * Extends Playwright's base test with authentication capabilities.
 * Uses storageState pattern for fast, pre-authenticated test contexts.
 */
export const test = base.extend<{
  loginPage: LoginPage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export { expect };
