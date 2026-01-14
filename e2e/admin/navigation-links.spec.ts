import { test, expect } from '@playwright/test';

/**
 * Admin Navigation Links Tests
 *
 * Verifies that navigation links preserve subdomain query params on localhost.
 * This is critical for local development where subdomain context is passed
 * via `?subdomain=westside` query parameter.
 *
 * On production (e.g., westside.stratadash.org), subdomains are handled
 * via hostname, so location.search is empty and these are no-ops.
 */

test.describe('Admin Navigation Links - Query Param Preservation', () => {
  /**
   * Test that breadcrumb links preserve subdomain context
   */
  test('breadcrumb link on ObjectiveDetail preserves subdomain query param', async ({ page }) => {
    // Navigate to an objective detail page with subdomain query param
    await page.goto('/admin/objectives/123?subdomain=westside');

    // Find the "All objectives" breadcrumb link
    const breadcrumbLink = page.locator('a', { hasText: 'All objectives' }).first();

    // Check that href includes the subdomain query param
    const href = await breadcrumbLink.getAttribute('href');
    expect(href).toContain('subdomain=westside');
    expect(href).toContain('/admin/objectives');
  });

  test('create objective link preserves subdomain query param', async ({ page }) => {
    // Navigate to admin dashboard with subdomain query param
    await page.goto('/admin?subdomain=westside');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find the create button/link
    const createLink = page.locator('a', { hasText: /Create.*objective|New objective/i }).first();

    // Check that href includes the subdomain query param
    if (await createLink.isVisible()) {
      const href = await createLink.getAttribute('href');
      expect(href).toContain('subdomain=westside');
      expect(href).toContain('/admin/objectives/create');
    }
  });

  test('objective title links preserve subdomain query param', async ({ page }) => {
    // Navigate to admin objectives list with subdomain query param
    await page.goto('/admin/objectives?subdomain=westside');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find objective title links
    const objectiveLinks = page.locator('[data-testid="objective-title"]');

    // Check first visible objective link
    if (await objectiveLinks.first().isVisible()) {
      const href = await objectiveLinks.first().getAttribute('href');
      expect(href).toContain('subdomain=westside');
      expect(href).toMatch(/\/admin\/objectives\/[\w-]+\?subdomain=westside/);
    }
  });

  test('breadcrumb link on CreateObjective preserves subdomain query param', async ({ page }) => {
    // Navigate to create objective page with subdomain query param
    await page.goto('/admin/objectives/create?subdomain=westside');

    // Find the "All objectives" breadcrumb link
    const breadcrumbLink = page.locator('a', { hasText: 'All objectives' }).first();

    // Check that href includes the subdomain query param
    const href = await breadcrumbLink.getAttribute('href');
    expect(href).toContain('subdomain=westside');
    expect(href).toContain('/admin/objectives');
  });

  test('breadcrumb link on EditObjective preserves subdomain query param', async ({ page }) => {
    // Navigate to edit objective page with subdomain query param
    await page.goto('/admin/objectives/123/edit?subdomain=westside');

    // Find the "All objectives" breadcrumb link
    const breadcrumbLink = page.locator('a', { hasText: 'All objectives' }).first();

    // Check that href includes the subdomain query param
    const href = await breadcrumbLink.getAttribute('href');
    expect(href).toContain('subdomain=westside');
    expect(href).toContain('/admin/objectives');
  });

  test('settings link on CreateObjective preserves subdomain query param', async ({ page }) => {
    // Navigate to create objective page with subdomain query param
    await page.goto('/admin/objectives/create?subdomain=westside');

    // Find the settings page link
    const settingsLink = page.locator('a', { hasText: /Strategic objectives settings/i });

    if (await settingsLink.isVisible()) {
      const href = await settingsLink.getAttribute('href');
      expect(href).toContain('subdomain=westside');
      expect(href).toContain('/admin/settings/objectives');
    }
  });
});

test.describe('Admin Navigation Links - Click Behavior', () => {
  /**
   * These tests verify actual navigation behavior when clicking links.
   * They ensure the URL after navigation includes the query param.
   */

  test('clicking breadcrumb navigates with preserved query param', async ({ page }) => {
    // Navigate to create objective page with subdomain query param
    await page.goto('/admin/objectives/create?subdomain=westside');

    // Find and click the breadcrumb link
    const breadcrumbLink = page.locator('a', { hasText: 'All objectives' }).first();
    await breadcrumbLink.click();

    // Verify URL includes subdomain query param
    await expect(page).toHaveURL(/\/admin\/objectives\?subdomain=westside/);
  });

  test('clicking objective navigates with preserved query param', async ({ page }) => {
    // Navigate to admin dashboard with subdomain query param
    await page.goto('/admin?subdomain=westside');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find an objective title link
    const objectiveLink = page.locator('[data-testid="objective-title"]').first();

    if (await objectiveLink.isVisible()) {
      await objectiveLink.click();

      // Verify URL includes subdomain query param
      await expect(page).toHaveURL(/\/admin\/objectives\/[\w-]+\?subdomain=westside/);
    }
  });

  test('clicking create button navigates with preserved query param', async ({ page }) => {
    // Navigate to admin dashboard with subdomain query param
    await page.goto('/admin?subdomain=westside');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find the create button/link
    const createLink = page.locator('a', { hasText: /Create.*objective|New objective/i }).first();

    if (await createLink.isVisible()) {
      await createLink.click();

      // Verify URL includes subdomain query param
      await expect(page).toHaveURL(/\/admin\/objectives\/create\?subdomain=westside/);
    }
  });
});

test.describe('Admin Navigation - Multiple Query Params', () => {
  /**
   * Verify that multiple query params are preserved, not just subdomain
   */

  test('preserves multiple query params on navigation', async ({ page }) => {
    // Navigate with multiple query params
    await page.goto('/admin/objectives/create?subdomain=westside&debug=true');

    // Find the breadcrumb link
    const breadcrumbLink = page.locator('a', { hasText: 'All objectives' }).first();
    const href = await breadcrumbLink.getAttribute('href');

    // Both params should be preserved
    expect(href).toContain('subdomain=westside');
    expect(href).toContain('debug=true');
  });
});

test.describe('Admin Navigation - Production Mode (No Query Params)', () => {
  /**
   * Verify navigation works correctly when there's no subdomain query param
   * (simulating production where subdomain is in hostname)
   */

  test('navigation works without subdomain query param', async ({ page }) => {
    // Navigate without query params (production mode)
    await page.goto('/admin/objectives/create');

    // Find the breadcrumb link
    const breadcrumbLink = page.locator('a', { hasText: 'All objectives' }).first();
    const href = await breadcrumbLink.getAttribute('href');

    // Should navigate to clean path without query string
    expect(href).toBe('/admin/objectives');
  });
});
