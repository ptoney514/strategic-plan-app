import { test, expect } from '@playwright/test';

/**
 * Auth Across Districts E2E Tests
 *
 * Verifies that authentication works correctly across the admin subdomain,
 * Westside, and Eastside district subdomains. Tests that system admin
 * credentials grant access to all subdomains, unauthenticated users are
 * redirected to login, and sessions persist when switching between districts.
 *
 * Uses the ?subdomain= query param to simulate subdomain routing in local dev.
 *
 * Prerequisites:
 * 1. System admin test credentials configured in .env.test
 * 2. At least two seeded districts (Westside, Eastside) in the database
 *
 * To run: npx playwright test e2e/auth/district-auth.spec.ts
 */

const shouldSkipAuthTests = !process.env.TEST_SYSTEM_ADMIN_EMAIL;

/**
 * Helper function to login as system admin.
 * Requires TEST_SYSTEM_ADMIN_EMAIL and TEST_SYSTEM_ADMIN_PASSWORD environment variables.
 */
async function loginAsSystemAdmin(page: any) {
  const email = process.env.TEST_SYSTEM_ADMIN_EMAIL;
  const password = process.env.TEST_SYSTEM_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'System admin test credentials not configured. ' +
      'Set TEST_SYSTEM_ADMIN_EMAIL and TEST_SYSTEM_ADMIN_PASSWORD in .env.test'
    );
  }

  // Navigate to login page with admin subdomain
  await page.goto('/login?subdomain=admin');

  // Fill in credentials
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  // Submit form
  await page.locator('button[type="submit"]').click();

  // Wait for navigation to admin dashboard
  await page.waitForURL(/\?subdomain=admin/, { timeout: 10000 });
}

test.describe('Auth Across Districts', () => {
  test.skip(shouldSkipAuthTests, 'requires test credentials');

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('System admin can access admin subdomain', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/?subdomain=admin');
    await page.waitForLoadState('networkidle');

    // Should show System Administration page, not login
    await expect(page.getByText('System Administration')).toBeVisible();
  });

  test('System admin can access Westside admin', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/admin?subdomain=westside');
    await page.waitForLoadState('networkidle');

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('System admin can access Eastside admin', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/admin?subdomain=eastside');
    await page.waitForLoadState('networkidle');

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('Unauthenticated user redirected to login on admin routes', async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies();

    await page.goto('/?subdomain=admin');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Session persists when switching between districts', async ({ page }) => {
    await loginAsSystemAdmin(page);

    // Access Westside admin
    await page.goto('/admin?subdomain=westside');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/login/);

    // Switch to Eastside admin (same session)
    await page.goto('/admin?subdomain=eastside');
    await page.waitForLoadState('networkidle');

    // Should still be authenticated
    await expect(page).not.toHaveURL(/\/login/);

    // Go back to system admin
    await page.goto('/?subdomain=admin');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('System Administration')).toBeVisible();
  });
});
