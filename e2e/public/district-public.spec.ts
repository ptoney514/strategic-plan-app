import { test, expect } from '@playwright/test';

/**
 * Public Access Tests
 *
 * Verify that public pages are accessible without authentication.
 * Tests the district landing page and goals page for the 'westside' district.
 */

test.describe('Public District Access', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we're not authenticated
    await page.context().clearCookies();
  });

  test('should display district landing page without login', async ({ page }) => {
    // Navigate to westside district landing page
    await page.goto('/westside');

    // Verify page loads successfully
    await expect(page).toHaveURL(/\/westside$/);

    // Check for district name or key content
    // TODO: Update this selector based on actual landing page structure
    await expect(page.locator('h1, h2, [role="heading"]')).toContainText(/westside/i);

    // Verify no login redirect occurred
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should display goals page without login', async ({ page }) => {
    // Navigate to westside goals page
    await page.goto('/westside/goals');

    // Verify page loads successfully
    await expect(page).toHaveURL(/\/westside\/goals$/);

    // Verify goals content is visible (adjust selector as needed)
    // TODO: Update selector based on actual goals page structure
    const goalsContainer = page.locator('[data-testid="goals-container"], .goals-list, main');
    await expect(goalsContainer).toBeVisible();

    // Verify no login redirect occurred
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should navigate from landing page to goals page', async ({ page }) => {
    // Start at landing page
    await page.goto('/westside');

    // Find and click link to goals page (adjust selector as needed)
    // TODO: Update selector based on actual navigation structure
    const goalsLink = page.locator('a[href*="/goals"], button:has-text("goals"), a:has-text("goals")').first();
    await goalsLink.click();

    // Verify navigation to goals page
    await expect(page).toHaveURL(/\/westside\/goals/);
  });

  test('should handle non-existent district gracefully', async ({ page }) => {
    // Navigate to non-existent district
    await page.goto('/nonexistent-district');

    // Should show "District not found" message
    await expect(page.locator('text=/district not found/i')).toBeVisible();

    // Verify "Return to Home" link exists
    const homeLink = page.locator('a[href="/"], a:has-text("home")').first();
    await expect(homeLink).toBeVisible();
  });

  test('should not show admin UI elements on public pages', async ({ page }) => {
    // Navigate to public goals page
    await page.goto('/westside/goals');

    // Verify admin-only buttons are not visible
    const adminButtons = [
      'text=/create.*goal/i',
      'text=/edit/i',
      'text=/delete/i',
      'text=/add.*metric/i',
      '[data-testid="admin-controls"]'
    ];

    for (const selector of adminButtons) {
      const element = page.locator(selector).first();
      const count = await element.count();
      expect(count).toBe(0);
    }
  });
});
