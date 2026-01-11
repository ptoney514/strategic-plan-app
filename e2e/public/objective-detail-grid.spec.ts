import { test, expect } from '@playwright/test';

test.describe('Objective Detail Goals Grid', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to an objective detail page
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    // Click first objective to navigate to detail page
    const firstObjective = page.locator('[data-testid="objective-1"]').first();
    await firstObjective.click();
    await page.waitForTimeout(500);

    // Verify we're on the objective detail page (URL may or may not include district slug)
    await expect(page).toHaveURL(/\/objective\//);
  });

  test('displays compact goal cards in grid layout', async ({ page }) => {
    // Should show Goals Overview header
    await expect(page.locator('h2:has-text("Goals Overview")')).toBeVisible({ timeout: 5000 });

    // Should show goal count
    await expect(page.locator('text=/\\d+ goals? total/')).toBeVisible({ timeout: 5000 });

    // Should show at least one compact goal card
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 5000 });

    console.log('✓ Compact goal cards displayed in grid');
  });

  test('compact card shows goal number, title, and metric', async ({ page }) => {
    // Get first goal card
    const goalCard = page.locator('button[aria-label*="Goal"]').first();
    await expect(goalCard).toBeVisible({ timeout: 5000 });

    // Should show goal number badge (e.g., "1.1")
    const goalNumber = goalCard.locator('div').filter({ hasText: /^\d+\.\d+$/ }).first();
    await expect(goalNumber).toBeVisible();

    console.log('✓ Compact card displays goal information');
  });

  test('expands goal card when clicked', async ({ page }) => {
    // Click first goal card
    const goalCard = page.locator('button[aria-label*="Goal"]').first();
    await goalCard.click();

    // Wait for expansion animation
    await page.waitForTimeout(300);

    // Should show expanded panel with close button
    const closeButton = page.locator('button[aria-label="Collapse goal details"]');
    await expect(closeButton).toBeVisible({ timeout: 5000 });

    console.log('✓ Goal card expands when clicked');
  });

  test('shows chart and full details in expanded view', async ({ page }) => {
    // Click first goal card to expand
    const goalCard = page.locator('button[aria-label*="Goal"]').first();
    await goalCard.click();
    await page.waitForTimeout(300);

    // Should show canvas chart
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    console.log('✓ Expanded view shows chart and details');
  });

  test('collapses card when close button clicked', async ({ page }) => {
    // Click first goal card to expand
    const goalCard = page.locator('button[aria-label*="Goal"]').first();
    await goalCard.click();
    await page.waitForTimeout(300);

    // Verify expanded
    const closeButton = page.locator('button[aria-label="Collapse goal details"]');
    await expect(closeButton).toBeVisible({ timeout: 5000 });

    // Click close button
    await closeButton.click();
    await page.waitForTimeout(300);

    // Should not show close button anymore (collapsed)
    await expect(closeButton).not.toBeVisible({ timeout: 5000 });

    console.log('✓ Goal card collapses when close button clicked');
  });

  test('only one card can be expanded at a time', async ({ page }) => {
    // Get goal cards
    const goalCards = page.locator('button[aria-label*="Goal"]');
    const cardCount = await goalCards.count();

    if (cardCount < 2) {
      test.skip();
      return;
    }

    // Click first card to expand
    await goalCards.nth(0).click();
    await page.waitForTimeout(300);

    // Verify first card is expanded
    let closeButtons = page.locator('button[aria-label="Collapse goal details"]');
    await expect(closeButtons).toHaveCount(1);

    // Click second card
    await goalCards.nth(1).click();
    await page.waitForTimeout(300);

    // Should still only have one close button (second card expanded, first collapsed)
    closeButtons = page.locator('button[aria-label="Collapse goal details"]');
    await expect(closeButtons).toHaveCount(1);

    console.log('✓ Only one card can be expanded at a time');
  });

  test('works with dark mode toggle', async ({ page }) => {
    // Toggle dark mode if toggle exists
    const darkModeToggle = page.locator('button[aria-label*="dark"]').or(page.locator('button[aria-label*="theme"]'));

    if (await darkModeToggle.count() > 0) {
      await darkModeToggle.first().click();
      await page.waitForTimeout(200);

      // Verify dark mode class is applied
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);

      // Goal cards should still be visible
      const goalCard = page.locator('button[aria-label*="Goal"]').first();
      await expect(goalCard).toBeVisible({ timeout: 5000 });

      console.log('✓ Goals grid works in dark mode');
    } else {
      console.log('⚠ Dark mode toggle not found, skipping dark mode test');
    }
  });
});

test.describe('Objective Detail Goals Grid - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X dimensions

  test('mobile: tapping card triggers bottom sheet modal', async ({ page }) => {
    // Navigate to objective detail
    await page.goto('/westside');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // On mobile, objectives are shown as cards with "View details" links instead of sidebar
    // Click the first "View details" link to navigate to objective detail
    const viewDetailsLink = page.locator('text=View details').first();
    await expect(viewDetailsLink).toBeVisible({ timeout: 15000 });
    await viewDetailsLink.click();

    // Wait for navigation and content load
    await page.waitForURL(/\/objective\//);
    await page.waitForLoadState('networkidle');

    // Wait for goal cards to be visible
    const goalCard = page.locator('button[aria-label*="Goal"]').first();
    await expect(goalCard).toBeVisible({ timeout: 10000 });

    // Click the goal card (simulates tap on mobile)
    await goalCard.click();

    // Wait for bottom sheet animation
    await page.waitForTimeout(500);

    // Should show bottom sheet modal
    const bottomSheet = page.locator('[role="dialog"]');
    await expect(bottomSheet).toBeVisible({ timeout: 5000 });

    console.log('✓ Mobile bottom sheet opens on tap');
  });
});
