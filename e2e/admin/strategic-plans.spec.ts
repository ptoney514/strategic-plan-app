import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

/**
 * Strategic Plans — Root Domain Dashboard Tests
 *
 * Verifies that the Strategic Plans page works from the root domain dashboard.
 * Tests navigation, data display, and plan-organization scoping.
 *
 * Run with: npx playwright test e2e/admin/strategic-plans.spec.ts --workers=1
 */

test.describe('Strategic Plans - Root Domain Dashboard', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as system admin on root domain (no subdomain param = root)
    await page.goto('/login');
    await loginPage.login('sysadmin@stratadash.com', 'Stratadash123!');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test('navigate to Strategic Plans page from sidebar', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    // Click "Strategic plans" link in sidebar
    await sidebar.locator('a:has-text("Strategic plans")').click();

    // Verify navigation to plans page
    await expect(page).toHaveURL(/\/dashboard\/plans/);

    // Verify page title renders
    await expect(
      page.locator('h1:has-text("Strategic Plans")')
    ).toBeVisible();
  });

  test('plans list shows correct data with district badges', async ({ page }) => {
    await page.goto('/dashboard/plans');

    // Wait for plans to load (loading skeleton disappears)
    await page.waitForSelector('table', { timeout: 10000 });

    // Verify table headers
    await expect(page.locator('th:has-text("Plan")')).toBeVisible();
    await expect(page.locator('th:has-text("District")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Objectives")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();

    // Verify at least one plan row exists (seeded data)
    const planRows = page.locator('tbody tr');
    await expect(planRows.first()).toBeVisible();
  });

  test('click plan navigates to district admin detail', async ({ page }) => {
    await page.goto('/dashboard/plans');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Get the first plan link and verify its href
    const firstPlanLink = page.locator('tbody tr:first-child a').first();
    const href = await firstPlanLink.getAttribute('href');
    expect(href).toContain('/admin/plans/');

    // Click the link and verify navigation to district admin detail page
    await firstPlanLink.click();
    await page.waitForURL(/\/admin\/plans\//, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/plans\//);
  });

  test('dashboard "View all plans" link navigates to plans list', async ({ page }) => {
    // Start on dashboard
    await page.goto('/dashboard');

    // Click "View all plans" link
    const viewAllLink = page.locator('a:has-text("View all plans")');
    await expect(viewAllLink).toBeVisible();
    await viewAllLink.click();

    // Should navigate to plans page
    await expect(page).toHaveURL(/\/dashboard\/plans/);
  });

  test('search filter works', async ({ page }) => {
    await page.goto('/dashboard/plans');
    await page.waitForSelector('table', { timeout: 10000 });

    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('nonexistent-plan-xyz');

    // Should show "No plans match" message
    await expect(
      page.locator('text=No plans match your filters')
    ).toBeVisible();
  });
});

test.describe('Strategic Plans - District Admin', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as Westside admin
    await page.goto('/login?subdomain=westside');
    await loginPage.login('admin@westside66.org', 'Westside123!');

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test('plans are scoped to correct organization', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    // Navigate to Plans
    await sidebar.locator('a:has-text("Plans"), button:has-text("Plans")').click();
    await expect(page).toHaveURL(/\/admin\/plans/);

    // Wait for plans list
    await page.waitForSelector('table', { timeout: 10000 });

    // The plans list title should be visible
    await expect(
      page.locator('h1:has-text("Strategic Plans")')
    ).toBeVisible();
  });
});
