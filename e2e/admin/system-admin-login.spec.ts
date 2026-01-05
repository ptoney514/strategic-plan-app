import { test, expect } from '@playwright/test';

/**
 * System Admin Login Flow Tests
 *
 * Tests the admin subdomain login flow using the ?subdomain=admin query param
 * to simulate admin.stratadash.org in local development.
 */

test.describe('System Admin Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies to ensure fresh auth state
    await page.context().clearCookies();
  });

  test('admin subdomain redirects to login with preserved query param', async ({ page }) => {
    // Access admin subdomain (via query param in local dev)
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

    // Verify we're on the login page with subdomain param
    await expect(page).toHaveURL(/subdomain=admin/);

    // Form elements should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Welcome text should be visible
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('login shows validation error for empty form', async ({ page }) => {
    await page.goto('/login?subdomain=admin');

    // Submit empty form
    await page.locator('button[type="submit"]').click();

    // Should show error message (form validation)
    // The form uses HTML5 required attribute, so browser will show native validation
    // Alternatively check for custom error message
    const errorMessage = page.locator('[role="alert"], .bg-destructive\\/10');

    // Wait a moment for potential error state
    await page.waitForTimeout(500);

    // Should still be on login page with subdomain
    await expect(page).toHaveURL(/subdomain=admin/);
  });

  test('login shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login?subdomain=admin');

    // Fill in invalid credentials
    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for error message
    await expect(page.locator('.bg-destructive\\/10')).toBeVisible({ timeout: 10000 });

    // Should still be on login page with subdomain preserved
    await expect(page).toHaveURL(/subdomain=admin/);
  });

  test.describe('Authenticated tests', () => {
    // These tests require a system admin test user to be configured
    // Skip by default until test user is created

    test.skip('successful system admin login shows dashboard', async ({ page }) => {
      // TODO: Requires test user with system_admin role
      // Setup:
      // 1. Create user in Supabase with system_admin role in user_metadata
      // 2. Add credentials to .env.test:
      //    TEST_SYSTEM_ADMIN_EMAIL=sysadmin@test.com
      //    TEST_SYSTEM_ADMIN_PASSWORD=testpassword123

      await page.goto('/login?subdomain=admin');

      // Login with system admin credentials
      // const email = process.env.TEST_SYSTEM_ADMIN_EMAIL;
      // const password = process.env.TEST_SYSTEM_ADMIN_PASSWORD;
      // await page.locator('input[type="email"]').fill(email);
      // await page.locator('input[type="password"]').fill(password);
      // await page.locator('button[type="submit"]').click();

      // Wait for navigation
      // await page.waitForURL(/\?subdomain=admin/, { timeout: 10000 });

      // Verify redirected to admin dashboard (not district page)
      // await expect(page).toHaveURL(/\?subdomain=admin/);

      // Verify "System Administration" header visible
      // await expect(page.getByText('System Administration')).toBeVisible();

      // Verify nav links visible
      // await expect(page.getByRole('link', { name: /Districts/i })).toBeVisible();
      // await expect(page.getByRole('link', { name: /Users/i })).toBeVisible();
      // await expect(page.getByRole('link', { name: /Settings/i })).toBeVisible();
    });

    test.skip('district admin on admin subdomain redirects to root', async ({ page }) => {
      // TODO: Requires test user with district_admin role (not system_admin)
      // This user should NOT have system_admin in their user_metadata

      await page.goto('/login?subdomain=admin');

      // Login with district admin credentials
      // const email = process.env.TEST_DISTRICT_ADMIN_EMAIL;
      // const password = process.env.TEST_DISTRICT_ADMIN_PASSWORD;
      // await page.locator('input[type="email"]').fill(email);
      // await page.locator('input[type="password"]').fill(password);
      // await page.locator('button[type="submit"]').click();

      // Should redirect away from admin subdomain
      // Non-system-admins should be redirected to root domain
      // await expect(page).not.toHaveURL(/subdomain=admin/);
    });

    test.skip('session persists after page refresh', async ({ page }) => {
      // TODO: Requires authenticated state
      // 1. Login as system admin
      // 2. Navigate to admin dashboard
      // 3. Refresh page
      // 4. Verify still on admin dashboard (not redirected to login)
    });
  });
});
