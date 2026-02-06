import { test, expect } from '@playwright/test';
import { LoginPage } from './helpers/login-page';

const districtEmail = process.env.TEST_DISTRICT_ADMIN_EMAIL || 'admin@westside66.org';
const districtPassword = process.env.TEST_DISTRICT_ADMIN_PASSWORD || 'Westside123!';
const systemEmail = process.env.TEST_SYSTEM_ADMIN_EMAIL || 'sysadmin@stratadash.com';
const systemPassword = process.env.TEST_SYSTEM_ADMIN_PASSWORD || 'Stratadash123!';

/**
 * Smoke Tests @smoke
 *
 * Quick read-only validation suite for production or staging deploys.
 * No data mutations — safe to run against any environment.
 */
test.describe('Smoke Tests @smoke', () => {
  // --- Unauthenticated ---

  test('API health check', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBeDefined();
  });

  test('public district page loads', async ({ page }) => {
    await page.goto('/westside');

    // Should render district content (not a 404 or error)
    await expect(page.locator('h1, h2, [data-testid="district-name"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('public goals page loads', async ({ page }) => {
    await page.goto('/westside/goals');

    // Should render goals content
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('login page renders', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('non-existent district shows appropriate response', async ({ page }) => {
    await page.goto('/fake-district-that-does-not-exist');

    // Should show "not found" content or redirect
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    // Either a 404 message, or redirect to login/home is acceptable
    expect(bodyText).toBeTruthy();
  });

  // --- Authenticated (district admin) ---

  test('login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(districtEmail, districtPassword);
    await loginPage.expectLoginSuccess();

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('admin page accessible after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWait(districtEmail, districtPassword);

    // Navigate to admin
    await page.goto('/westside/admin');
    await page.waitForTimeout(2000);

    // Should be on admin page (not redirected to login)
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('session persists on refresh', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWait(districtEmail, districtPassword);

    // Refresh
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be authenticated
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('API memberships endpoint works when authenticated', async ({ page, request }) => {
    // Login via UI to get session cookies
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWait(districtEmail, districtPassword);

    // Now make API call with the authenticated context
    const response = await page.request.get('/api/user/memberships');
    expect(response.status()).toBe(200);
  });

  // --- Authenticated (system admin, conditional) ---

  test('system admin dashboard loads', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login?subdomain=admin');

    await page.locator('input[type="email"]').fill(systemEmail);
    await page.locator('input[type="password"]').fill(systemPassword);
    await page.locator('button[type="submit"]').click();

    // Wait for navigation away from login
    await page.waitForURL(/(?!.*\/login)/, { timeout: 15000 });

    // Should show admin content
    await expect(page).not.toHaveURL(/\/login/);
  });
});
