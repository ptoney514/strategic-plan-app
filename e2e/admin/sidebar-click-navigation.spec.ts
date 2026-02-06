import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

/**
 * Admin Sidebar Click Navigation Tests
 *
 * Verifies that the sidebar navigation remains clickable after various
 * interactions on admin pages, specifically the Objective Detail page.
 *
 * Issue: Sidebar navigation became unresponsive after interactions on
 * the Objective Detail page due to z-index stacking issues.
 *
 * Fix: Increased sidebar z-index from z-20 to z-40 to ensure it stays
 * above any dynamically created overlays.
 */

test.describe('Admin Sidebar Click Navigation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as district admin
    await loginPage.goto();
    const email = process.env.TEST_DISTRICT_ADMIN_EMAIL || 'admin@westside66.org';
    const password = process.env.TEST_DISTRICT_ADMIN_PASSWORD || 'Westside123!';
    await loginPage.login(email, password);

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test.describe('Sidebar Visibility and Clickability', () => {
    test('sidebar should be visible and clickable on admin dashboard', async ({ page }) => {
      // Sidebar should be visible
      const sidebar = page.locator('aside').first();
      await expect(sidebar).toBeVisible();

      // All navigation links should be clickable
      const homeLink = sidebar.locator('a:has-text("Home")');
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toBeEnabled();

      const objectivesLink = sidebar.locator('a:has-text("Objectives & goals")');
      await expect(objectivesLink).toBeVisible();
      await expect(objectivesLink).toBeEnabled();
    });

    test('sidebar links should navigate correctly', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Click Objectives & goals
      await sidebar.locator('a:has-text("Objectives & goals")').click();
      await expect(page).toHaveURL(/\/objectives/);

      // Click Home to go back
      await sidebar.locator('a:has-text("Home")').click();
      await expect(page).toHaveURL(/\/admin\/?$/);
    });
  });

  test.describe('Sidebar After Page Interactions', () => {
    test('sidebar remains clickable after visiting objectives page', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Navigate to objectives page
      await sidebar.locator('a:has-text("Objectives & goals")').click();
      await expect(page).toHaveURL(/\/objectives/);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Sidebar should still be clickable
      const homeLink = sidebar.locator('a:has-text("Home")');
      await expect(homeLink).toBeVisible();

      // Click and verify navigation works
      await homeLink.click();
      await expect(page).toHaveURL(/\/admin\/?$/);
    });

    test('sidebar remains clickable after clicking on objective card', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Navigate to objectives page
      await sidebar.locator('a:has-text("Objectives & goals")').click();
      await page.waitForLoadState('networkidle');

      // Look for any clickable objective card or link
      const objectiveCard = page.locator('[data-testid^="objective-"], a[href*="/objectives/"]').first();
      const hasObjectiveCard = await objectiveCard.count() > 0;

      if (hasObjectiveCard) {
        // Click on the objective
        await objectiveCard.click();
        await page.waitForTimeout(500);

        // Sidebar should still be clickable
        const strategicPlansLink = sidebar.locator('a:has-text("Strategic plans")');
        await expect(strategicPlansLink).toBeVisible();

        // Test that click works
        await strategicPlansLink.click();
        await expect(page).toHaveURL(/\/plans/);
      }
    });

    test('sidebar remains clickable after scrolling the page', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Navigate to objectives page
      await sidebar.locator('a:has-text("Objectives & goals")').click();
      await page.waitForLoadState('networkidle');

      // Scroll the main content area
      await page.evaluate(() => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.scrollTop = 500;
        }
      });

      // Wait a moment for any scroll-triggered effects
      await page.waitForTimeout(300);

      // Sidebar should still be clickable
      const metricsLink = sidebar.locator('a:has-text("Metrics")');
      await expect(metricsLink).toBeVisible();

      await metricsLink.click();
      await expect(page).toHaveURL(/\/metrics/);
    });
  });

  test.describe('Sidebar Z-Index Stacking', () => {
    test('sidebar should be above main content', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Check that sidebar has z-40 class
      await expect(sidebar).toHaveClass(/z-40/);

      // Verify it's positioned as fixed
      await expect(sidebar).toHaveClass(/fixed/);
    });

    test('sidebar should remain clickable when overlapping with absolute elements', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Navigate to a page that has absolute positioned elements (gradient overlay)
      await sidebar.locator('a:has-text("Objectives & goals")').click();
      await page.waitForLoadState('networkidle');

      // The page has a gradient overlay with absolute positioning
      // Sidebar should still be above it

      // Test clicking multiple sidebar links in sequence
      const links = ['Home', 'Strategic plans', 'Metrics', 'Dashboards'];

      for (const linkText of links) {
        const link = sidebar.locator(`a:has-text("${linkText}")`);
        await expect(link).toBeVisible();

        // Verify the link receives click events (not blocked by overlay)
        await link.click();
        await page.waitForTimeout(200);
      }
    });
  });

  test.describe('Objective Detail Page Interactions', () => {
    test('sidebar remains clickable after objective detail page loads', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Navigate to objectives list
      await sidebar.locator('a:has-text("Objectives & goals")').click();
      await page.waitForLoadState('networkidle');

      // Find and click on an objective to go to detail page
      const objectiveLink = page.locator('a[href*="/objectives/"]').first();
      const hasObjective = await objectiveLink.count() > 0;

      if (hasObjective) {
        await objectiveLink.click();
        await page.waitForLoadState('networkidle');

        // Verify we're on objective detail page
        await expect(page).toHaveURL(/\/objectives\/[^/]+$/);

        // Sidebar should still be visible and clickable
        await expect(sidebar).toBeVisible();

        // Test clicking Home link
        const homeLink = sidebar.locator('a:has-text("Home")');
        await expect(homeLink).toBeVisible();
        await homeLink.click();

        await expect(page).toHaveURL(/\/admin\/?$/);
      }
    });

    test('sidebar remains clickable after interacting with goal cards', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Navigate to objectives list
      await sidebar.locator('a:has-text("Objectives & goals")').click();
      await page.waitForLoadState('networkidle');

      // Try to find expandable goal cards
      const expandButton = page.locator('button:has-text("Expand"), [data-testid="expand-goal"]').first();
      const hasExpandButton = await expandButton.count() > 0;

      if (hasExpandButton) {
        // Click expand button
        await expandButton.click();
        await page.waitForTimeout(300);

        // Sidebar should still work
        const reportsLink = sidebar.locator('a:has-text("Reports")');
        await expect(reportsLink).toBeVisible();
        await reportsLink.click();
        await expect(page).toHaveURL(/\/reports/);
      }
    });

    test('sidebar remains clickable after editing interactions', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Navigate to objectives
      await sidebar.locator('a:has-text("Objectives & goals")').click();
      await page.waitForLoadState('networkidle');

      // Look for edit buttons
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      const hasEditButton = await editButton.count() > 0;

      if (hasEditButton) {
        // Click edit button to trigger inline editing
        await editButton.click();
        await page.waitForTimeout(300);

        // Click somewhere else to potentially close edit mode
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);

        // Sidebar should still work
        const metricsLink = sidebar.locator('a:has-text("Metrics")');
        await expect(metricsLink).toBeVisible();
        await metricsLink.click();
        await expect(page).toHaveURL(/\/metrics/);
      }
    });
  });

  test.describe('Multiple Navigation Cycles', () => {
    test('sidebar works through multiple navigation cycles', async ({ page }) => {
      const sidebar = page.locator('aside').first();

      // Cycle through multiple pages
      const navigationCycle = [
        { link: 'Objectives & goals', urlPattern: /\/objectives/ },
        { link: 'Home', urlPattern: /\/admin\/?$/ },
        { link: 'Strategic plans', urlPattern: /\/plans/ },
        { link: 'Metrics', urlPattern: /\/metrics/ },
        { link: 'Dashboards', urlPattern: /\/dashboards/ },
        { link: 'Reports', urlPattern: /\/reports/ },
        { link: 'Home', urlPattern: /\/admin\/?$/ },
      ];

      for (const { link, urlPattern } of navigationCycle) {
        const navLink = sidebar.locator(`a:has-text("${link}")`);
        await expect(navLink).toBeVisible();
        await navLink.click();
        await expect(page).toHaveURL(urlPattern);
        await page.waitForTimeout(100);
      }
    });
  });
});

