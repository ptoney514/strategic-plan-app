import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

/**
 * Editorial Redesign Smoke Tests
 *
 * Lightweight E2E tests to verify the admin pages redesign:
 * 1. Login page renders and works
 * 2. Editorial sidebar appears with correct structure
 * 3. Each admin page loads without errors
 *
 * Uses subdomain query param for localhost testing.
 */

test.describe('Login Page', () => {
  test('login page renders with email and password fields', async ({ page }) => {
    await page.goto('/login');
    const loginPage = new LoginPage(page);

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('login page shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    const loginPage = new LoginPage(page);

    await loginPage.login('fake@invalid.com', 'wrongpassword');

    // Should stay on login page and show error
    await expect(page).toHaveURL(/\/login/);
    // Wait for error to appear (auth request may take a moment)
    await page.waitForTimeout(2000);
    const errorIndicator = page.locator('[role="alert"], .text-red-600, .text-red-500, [data-testid="error"]');
    await expect(errorIndicator.first()).toBeVisible();
  });
});

test.describe('Admin Editorial Redesign', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as district admin using subdomain query param
    await page.goto('/login?subdomain=westside');
    await loginPage.login('admin@westside66.org', 'Westside123!');
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test.describe('Editorial Sidebar', () => {
    test('sidebar has editorial dark theme', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await expect(sidebar).toBeVisible();

      // Check dark background color (--editorial-sidebar-bg: #1a1a1a)
      const bgColor = await sidebar.evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toContain('26'); // rgb(26, 26, 26)
    });

    test('sidebar has district switcher header', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // District name or switcher should be present
      const districtHeader = sidebar.locator('text=Strategic Planning');
      await expect(districtHeader).toBeVisible();
    });

    test('sidebar has View Public Site footer', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await expect(sidebar.locator('button:has-text("View Public Site")')).toBeVisible();
    });
  });

  test.describe('Admin Pages Load Without Errors', () => {
    test('Dashboard page loads with greeting and stats', async ({ page }) => {
      // Should already be on dashboard after login
      await expect(page).toHaveURL(/\/admin\/?$/);

      // Dashboard heading
      await expect(page.locator('text=Dashboard')).toBeVisible();

      // Stats cards should be present (Plans, Objectives, Metrics)
      await expect(page.locator('text=Plans').first()).toBeVisible();
      await expect(page.locator('text=Objectives').first()).toBeVisible();

      // Strategic Plans section
      await expect(page.locator('text=Strategic Plans')).toBeVisible();
    });

    test('Plans page loads with editorial styling', async ({ page }) => {
      await page.locator('aside button:has-text("Plans")').click();
      await expect(page).toHaveURL(/\/admin\/plans/);

      // Page heading
      await expect(page.locator('h1:has-text("Strategic Plans")')).toBeVisible();

      // Should have warm paper background (--editorial-bg: #faf9f7)
      const mainContent = page.locator('main').first();
      const bgColor = await mainContent.evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );
      // rgb(250, 249, 247) = #faf9f7
      expect(bgColor).toContain('250');
    });

    test('Objectives page loads', async ({ page }) => {
      await page.locator('aside button:has-text("Objectives & Goals")').click();
      await expect(page).toHaveURL(/\/admin\/objectives/);

      // Wait for page content to load
      await page.waitForLoadState('networkidle');

      // Should have some content (either objectives list or empty state)
      const hasContent = await page.locator('main').first().isVisible();
      expect(hasContent).toBe(true);
    });

    test('Users page loads with editorial styling', async ({ page }) => {
      await page.locator('aside button:has-text("Users")').click();
      await expect(page).toHaveURL(/\/admin\/users/);

      // Page heading
      await expect(page.locator('h1:has-text("Team Members")')).toBeVisible();
    });

    test('Appearance page loads with editorial styling', async ({ page }) => {
      await page.locator('aside button:has-text("Appearance")').click();
      await expect(page).toHaveURL(/\/admin\/appearance/);

      // Page heading
      await expect(page.locator('h1:has-text("Appearance")')).toBeVisible();
    });

    test('Settings page loads with editorial styling', async ({ page }) => {
      await page.locator('aside button:has-text("Settings")').click();
      await expect(page).toHaveURL(/\/admin\/settings/);

      // Page heading
      await expect(page.locator('h1:has-text("District Settings")')).toBeVisible();
    });
  });

  test.describe('No Console Errors', () => {
    test('admin pages should not have critical console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignore known non-critical errors
          if (!text.includes('favicon') && !text.includes('ResizeObserver')) {
            errors.push(text);
          }
        }
      });

      // Visit each admin page
      const pages = [
        '/admin',
        '/admin/plans',
        '/admin/objectives',
        '/admin/users',
        '/admin/appearance',
        '/admin/settings',
      ];

      for (const path of pages) {
        await page.goto(path + '?subdomain=westside');
        await page.waitForLoadState('networkidle');
      }

      // Allow some API errors (expected if no backend), but no React crashes
      const criticalErrors = errors.filter(
        (e) => e.includes('Uncaught') || e.includes('React error') || e.includes('chunk')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });
});
