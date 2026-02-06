import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

const districtEmail = process.env.TEST_DISTRICT_ADMIN_EMAIL || 'admin@westside66.org';
const districtPassword = process.env.TEST_DISTRICT_ADMIN_PASSWORD || 'Westside123!';

/**
 * Authentication Flow Tests
 *
 * Verify login, logout, and authentication guards work correctly.
 * Tests both successful and failed authentication scenarios.
 */

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    // Ensure we start unauthenticated
    await page.context().clearCookies();
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Try to submit without filling in fields
    await loginPage.submitButton.click();

    // Should show validation errors (HTML5 required or custom alert)
    const errorMessages = page.locator('[role="alert"], .error-message, [data-testid="error"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Should show error message
    await loginPage.expectLoginFailure();

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await loginPage.login(districtEmail, districtPassword);
    await loginPage.expectLoginSuccess();

    // Should redirect away from login page
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing admin pages without auth', async ({ page }) => {
    await page.goto('/westside/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing admin goals without auth', async ({ page }) => {
    await page.goto('/westside/admin/goals');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing objective builder without auth', async ({ page }) => {
    await page.goto('/westside/admin/objectives/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login
    await loginPage.loginAndWait(districtEmail, districtPassword);

    // Refresh the page
    await page.reload();

    // Should not be redirected back to login
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should successfully logout', async ({ page }) => {
    // Login
    await loginPage.loginAndWait(districtEmail, districtPassword);

    // Click on the user avatar/menu button to open dropdown
    const avatarButton = page.locator('button[data-testid="user-menu"], button:has(img[alt*="avatar"]), button:has(.rounded-full)').first();
    await avatarButton.click();

    // Click logout
    const logoutButton = page.getByRole('menuitem', { name: /log\s*out|sign\s*out/i });
    await logoutButton.click();

    // Should redirect to login or home
    await expect(page).toHaveURL(/\/(login)?$/);

    // Trying to access admin should redirect to login
    await page.goto('/westside/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
