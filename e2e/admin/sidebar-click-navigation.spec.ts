import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

/**
 * Admin Sidebar Click Navigation Tests (Editorial Redesign)
 *
 * Verifies that the redesigned editorial sidebar navigation works correctly.
 * The sidebar now uses button elements with grouped sections:
 *   MAIN: Dashboard, Plans, Objectives & Goals
 *   MANAGE: Users, Appearance, Settings
 *
 * Uses subdomain query param for localhost testing.
 */

test.describe('Admin Sidebar Click Navigation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Navigate to login with subdomain query param for localhost
    await page.goto('/login?subdomain=westside');
    await loginPage.login('admin@westside66.org', 'Westside123!');

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test.describe('Sidebar Visibility and Structure', () => {
    test('sidebar should be visible with editorial dark theme', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await expect(sidebar).toBeVisible();

      // Verify editorial dark background
      const bgColor = await sidebar.evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );
      // Should be dark (#1a1a1a = rgb(26, 26, 26))
      expect(bgColor).toContain('26');
    });

    test('sidebar should show MAIN section with correct nav items', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Section label
      await expect(sidebar.locator('text=Main').first()).toBeVisible();

      // Nav items under MAIN
      await expect(sidebar.locator('button:has-text("Dashboard")')).toBeVisible();
      await expect(sidebar.locator('button:has-text("Plans")')).toBeVisible();
      await expect(sidebar.locator('button:has-text("Objectives & Goals")')).toBeVisible();
    });

    test('sidebar should show MANAGE section with correct nav items', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Section label
      await expect(sidebar.locator('text=Manage').first()).toBeVisible();

      // Nav items under MANAGE
      await expect(sidebar.locator('button:has-text("Users")')).toBeVisible();
      await expect(sidebar.locator('button:has-text("Appearance")')).toBeVisible();
      await expect(sidebar.locator('button:has-text("Settings")')).toBeVisible();
    });

    test('sidebar should NOT show old placeholder nav items', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // These old items should no longer exist
      await expect(sidebar.locator('text=Metrics')).toHaveCount(0);
      await expect(sidebar.locator('text=Dashboards')).toHaveCount(0);
      await expect(sidebar.locator('text=Reports')).toHaveCount(0);
      await expect(sidebar.locator('text=Visual Library')).toHaveCount(0);
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('Dashboard link navigates to /admin', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await sidebar.locator('button:has-text("Dashboard")').click();
      await expect(page).toHaveURL(/\/admin\/?$/);
    });

    test('Plans link navigates to /admin/plans', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await sidebar.locator('button:has-text("Plans")').click();
      await expect(page).toHaveURL(/\/admin\/plans/);
    });

    test('Objectives & Goals link navigates to /admin/objectives', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await sidebar.locator('button:has-text("Objectives & Goals")').click();
      await expect(page).toHaveURL(/\/admin\/objectives/);
    });

    test('Users link navigates to /admin/users', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await sidebar.locator('button:has-text("Users")').click();
      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('Appearance link navigates to /admin/appearance', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await sidebar.locator('button:has-text("Appearance")').click();
      await expect(page).toHaveURL(/\/admin\/appearance/);
    });

    test('Settings link navigates to /admin/settings', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await sidebar.locator('button:has-text("Settings")').click();
      await expect(page).toHaveURL(/\/admin\/settings/);
    });
  });

  test.describe('Multi-page Navigation Cycle', () => {
    test('sidebar works through complete navigation cycle', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      const navigationCycle = [
        { button: 'Plans', urlPattern: /\/admin\/plans/ },
        { button: 'Objectives & Goals', urlPattern: /\/admin\/objectives/ },
        { button: 'Users', urlPattern: /\/admin\/users/ },
        { button: 'Appearance', urlPattern: /\/admin\/appearance/ },
        { button: 'Settings', urlPattern: /\/admin\/settings/ },
        { button: 'Dashboard', urlPattern: /\/admin\/?$/ },
      ];

      for (const { button, urlPattern } of navigationCycle) {
        const navButton = sidebar.locator(`button:has-text("${button}")`);
        await expect(navButton).toBeVisible();
        await navButton.click();
        await expect(page).toHaveURL(urlPattern);
        await page.waitForTimeout(100);
      }
    });
  });

  test.describe('View Public Site', () => {
    test('View Public Site button is visible in sidebar footer', async ({ page }) => {
      const sidebar = page.locator('aside').first();
      await expect(sidebar.locator('button:has-text("View Public Site")')).toBeVisible();
    });
  });
});
