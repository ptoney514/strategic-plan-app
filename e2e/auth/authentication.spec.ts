import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

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

    // Should show validation errors (adjust selectors as needed)
    const errorMessages = page.locator('[role="alert"], .error-message, [data-testid="error"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Try to login with invalid credentials
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Should show error message
    await expect(loginPage.errorMessage).toBeVisible();

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip('should successfully login with valid credentials', async ({ page }) => {
    // TODO: This test requires valid test credentials
    // Uncomment and update when test user is created
    //
    // await loginPage.login('test@westside66.org', 'testpassword');
    // await loginPage.expectLoginSuccess();
    //
    // // Should redirect away from login page
    // await expect(page).not.toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing admin pages without auth', async ({ page }) => {
    // Try to access admin page directly
    await page.goto('/westside/admin');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing admin goals without auth', async ({ page }) => {
    // Try to access admin goals page directly
    await page.goto('/westside/admin/goals');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing objective builder without auth', async ({ page }) => {
    // Try to access objective builder directly
    await page.goto('/westside/admin/objectives/new');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip('should maintain session after page refresh', async ({ page }) => {
    // TODO: Implement after authentication is working
    // 1. Login
    // 2. Navigate to admin page
    // 3. Refresh page
    // 4. Verify still authenticated (not redirected to login)
  });

  test.skip('should successfully logout', async ({ page }) => {
    // TODO: Implement after authentication is working
    // 1. Login
    // 2. Click logout button
    // 3. Verify redirected to home or login
    // 4. Try to access admin page - should redirect to login
  });
});
