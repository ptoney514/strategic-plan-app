import { test, expect } from '@playwright/test';

/**
 * AdminDashboard2 Objectives Formatting Tests
 *
 * Tests that objective rows display title above description correctly.
 * These tests verify the visual layout of the objectives list.
 *
 * Prerequisites:
 * 1. Dev server running (npm run dev)
 * 2. Test users seeded (npx tsx scripts/seed.ts)
 * 3. Database accessible (Neon connection configured)
 *
 * To enable these tests:
 * 1. Ensure prerequisites above are met
 * 2. Change test.describe.skip to test.describe
 */

// Skip tests by default - requires authentication setup
// Change to test.describe(...) to enable when test users are created
test.describe.skip('Objectives List Formatting', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.waitForSelector('input[placeholder="you@example.com"]', { timeout: 10000 });

    // Fill login form with test credentials
    await page.fill('input[placeholder="you@example.com"]', 'admin@westside66.org');
    await page.fill('input[placeholder="Enter your password"]', 'Westside123!');
    await page.click('button:has-text("Sign in")');

    // Wait for redirect after login and navigate to admin2
    await page.waitForURL(/\/westside/, { timeout: 15000 });
    await page.goto('/westside/admin2');

    // Wait for the page to load objectives
    await page.waitForSelector('[data-testid="objective-title"], .animate-fadeInUp', { timeout: 15000 });
  });

  test('should display objective title above description', async ({ page }) => {
    // Get the first objective row
    const firstObjective = page.locator('.animate-fadeInUp').first();
    await expect(firstObjective).toBeVisible();

    // Find title and description elements within the objective row
    const title = firstObjective.locator('[data-testid="objective-title"]');
    const description = firstObjective.locator('[data-testid="objective-description"]');

    // Verify title exists
    await expect(title).toBeVisible();

    // Get bounding boxes to verify vertical positioning
    const titleBox = await title.boundingBox();
    const descriptionBox = await description.boundingBox();

    // If description exists, verify title is above description
    if (descriptionBox) {
      expect(titleBox).not.toBeNull();
      expect(descriptionBox).not.toBeNull();

      if (titleBox && descriptionBox) {
        // Title's top should be less than (above) description's top
        expect(titleBox.y).toBeLessThan(descriptionBox.y);

        // Title and description should NOT be on the same line
        // Title's bottom should be at or above description's top
        expect(titleBox.y + titleBox.height).toBeLessThanOrEqual(descriptionBox.y + 5); // 5px tolerance
      }
    }
  });

  test('should have title and description in flex-col container', async ({ page }) => {
    // Get the first objective row's title/description container
    const firstObjective = page.locator('.animate-fadeInUp').first();
    const contentContainer = firstObjective.locator('.flex-col').first();

    await expect(contentContainer).toBeVisible();

    // Verify the container has flex-col class (vertical stacking)
    const hasFlexCol = await contentContainer.evaluate((el) =>
      el.classList.contains('flex-col')
    );
    expect(hasFlexCol).toBe(true);
  });

  test('should have bold title styling', async ({ page }) => {
    const firstObjective = page.locator('.animate-fadeInUp').first();
    const title = firstObjective.locator('[data-testid="objective-title"]');

    await expect(title).toBeVisible();

    // Verify title has bold font weight
    const fontWeight = await title.evaluate((el) =>
      window.getComputedStyle(el).fontWeight
    );

    // font-weight: bold is typically 700
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test('should have lighter description styling', async ({ page }) => {
    const firstObjective = page.locator('.animate-fadeInUp').first();
    const description = firstObjective.locator('[data-testid="objective-description"]');

    // Description may not exist for all objectives
    if (await description.count() > 0) {
      await expect(description).toBeVisible();

      // Verify description has lighter color than title
      const color = await description.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      // Description should have a gray-ish color (not black)
      // #6a6a6a in RGB is approximately (106, 106, 106)
      expect(color).not.toBe('rgb(26, 26, 26)'); // Not the same as title color
    }
  });

  test('should show multiple objectives with consistent formatting', async ({ page }) => {
    // Get all visible objectives
    const objectives = page.locator('.animate-fadeInUp');
    const count = await objectives.count();

    // Should have at least one objective
    expect(count).toBeGreaterThan(0);

    // Check each objective has consistent structure
    for (let i = 0; i < Math.min(count, 3); i++) {
      const objective = objectives.nth(i);
      const title = objective.locator('[data-testid="objective-title"]');

      await expect(title).toBeVisible();
      await expect(title).not.toBeEmpty();
    }
  });

  test('should truncate long descriptions appropriately', async ({ page }) => {
    // Find an objective with a description
    const objectiveWithDescription = page.locator('.animate-fadeInUp')
      .filter({ has: page.locator('[data-testid="objective-description"]') })
      .first();

    if (await objectiveWithDescription.count() > 0) {
      const description = objectiveWithDescription.locator('[data-testid="objective-description"]');

      // Verify description has line-clamp class for truncation
      const hasLineClamp = await description.evaluate((el) =>
        el.classList.contains('line-clamp-2') ||
        window.getComputedStyle(el).webkitLineClamp === '2'
      );

      expect(hasLineClamp).toBe(true);
    }
  });
});
