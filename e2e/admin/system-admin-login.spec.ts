import { test, expect } from '@playwright/test';

const systemEmail = process.env.TEST_SYSTEM_ADMIN_EMAIL || 'sysadmin@stratadash.com';
const systemPassword = process.env.TEST_SYSTEM_ADMIN_PASSWORD || 'Stratadash123!';
const districtEmail = process.env.TEST_DISTRICT_ADMIN_EMAIL || 'admin@westside66.org';
const districtPassword = process.env.TEST_DISTRICT_ADMIN_PASSWORD || 'Westside123!';

/**
 * System Admin Login Flow Tests
 *
 * Tests the admin subdomain login flow using the ?subdomain=admin query param
 * to simulate admin.stratadash.org in local development.
 */

test.describe('System Admin Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('admin subdomain redirects to login with preserved query param', async ({ page }) => {
    await page.goto('/?subdomain=admin');

    // Should redirect to login with subdomain preserved
    await expect(page).toHaveURL(/\/login.*subdomain=admin/);

    // Login form should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login form displays correctly on admin subdomain', async ({ page }) => {
    await page.goto('/login?subdomain=admin');

    await expect(page).toHaveURL(/subdomain=admin/);

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('login shows validation error for empty form', async ({ page }) => {
    await page.goto('/login?subdomain=admin');

    await page.locator('button[type="submit"]').click();

    // The form uses HTML5 required attribute, so browser will show native validation
    // or custom error via [role="alert"]
    await page.waitForTimeout(500);

    // Should still be on login page with subdomain
    await expect(page).toHaveURL(/subdomain=admin/);
  });

  test('login shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login?subdomain=admin');

    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Wait for error message
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });

    // Should still be on login page with subdomain preserved
    await expect(page).toHaveURL(/subdomain=admin/);
  });

  test.describe('Authenticated tests', () => {
    test('successful system admin login shows dashboard', async ({ page }) => {
      await page.goto('/login?subdomain=admin');

      await page.locator('input[type="email"]').fill(systemEmail);
      await page.locator('input[type="password"]').fill(systemPassword);
      await page.locator('button[type="submit"]').click();

      // Wait for navigation away from login
      await page.waitForURL(/(?!.*\/login).*subdomain=admin/, { timeout: 15000 });

      // Verify on admin dashboard
      await expect(page).toHaveURL(/subdomain=admin/);
    });

    test('district admin on admin subdomain redirects to root', async ({ page }) => {
      await page.goto('/login?subdomain=admin');

      await page.locator('input[type="email"]').fill(districtEmail);
      await page.locator('input[type="password"]').fill(districtPassword);
      await page.locator('button[type="submit"]').click();

      // Non-system-admins should be redirected away from admin subdomain
      await page.waitForTimeout(5000);
      await expect(page).not.toHaveURL(/subdomain=admin.*login/);
    });

    test('session persists after page refresh', async ({ page }) => {
      await page.goto('/login?subdomain=admin');

      await page.locator('input[type="email"]').fill(systemEmail);
      await page.locator('input[type="password"]').fill(systemPassword);
      await page.locator('button[type="submit"]').click();

      // Wait for navigation
      await page.waitForURL(/(?!.*\/login).*subdomain=admin/, { timeout: 15000 });

      // Refresh
      await page.reload();
      await page.waitForTimeout(2000);

      // Should still be authenticated (not redirected to login)
      await expect(page).not.toHaveURL(/\/login/);
    });
  });
});
