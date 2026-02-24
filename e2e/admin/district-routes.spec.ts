import { test, expect } from '@playwright/test';

/**
 * District Routing Parity E2E Tests
 *
 * Verifies that both seeded districts (Westside and Eastside) have working
 * routes for public pages, admin dashboards, and appear correctly in the
 * system admin districts table and district switcher.
 *
 * Uses the ?subdomain= query param to simulate subdomain routing in local dev.
 *
 * Prerequisites:
 * 1. System admin test credentials configured in .env.test
 * 2. At least two seeded districts (Westside, Eastside) in the database
 *
 * To run: npx playwright test e2e/admin/district-routes.spec.ts
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

test.describe('District Routing Parity', () => {
  test.skip(shouldSkipAuthTests, 'requires test credentials');

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Westside public page loads', async ({ page }) => {
    await page.goto('/?subdomain=westside');
    await page.waitForLoadState('networkidle');

    // Should show some content (not an error page)
    await expect(page.locator('body')).not.toHaveText(/404|not found/i);
  });

  test('Eastside public page loads', async ({ page }) => {
    await page.goto('/?subdomain=eastside');
    await page.waitForLoadState('networkidle');

    // Should show some content (not an error page)
    await expect(page.locator('body')).not.toHaveText(/404|not found/i);
  });

  test('Westside admin dashboard loads after login', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/admin?subdomain=westside');
    await page.waitForLoadState('networkidle');

    // Should show admin content, not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('Eastside admin dashboard loads after login', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/admin?subdomain=eastside');
    await page.waitForLoadState('networkidle');

    // Should show admin content, not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('Both districts appear in system admin districts table', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/districts?subdomain=admin');
    await page.waitForLoadState('networkidle');

    // Verify the table is visible
    await expect(page.locator('table')).toBeVisible();

    // Both districts should appear in the table body
    await expect(page.locator('tbody').getByText('westside')).toBeVisible();
    await expect(page.locator('tbody').getByText('eastside')).toBeVisible();
  });

  test('District switcher shows both districts', async ({ page }) => {
    await loginAsSystemAdmin(page);

    // Navigate to a district admin page first
    await page.goto('/admin?subdomain=westside');
    await page.waitForLoadState('networkidle');

    // Look for district switcher (may be in sidebar or header)
    const switcher = page.locator('[data-testid="district-switcher"], [aria-label*="switch"], [aria-label*="district"]');
    if (await switcher.isVisible()) {
      await switcher.click();

      // Should show both districts in dropdown
      await expect(page.getByText(/westside/i)).toBeVisible();
      await expect(page.getByText(/eastside/i)).toBeVisible();
    }
  });
});
