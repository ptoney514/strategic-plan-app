import { test, expect } from '@playwright/test';

/**
 * Sidebar Goal Expansion Tests
 *
 * Tests for clicking goals in the sidebar to expand goal cards on the
 * ObjectiveDetail page, and verifying the expanded card scrolls to center.
 */

test.describe('Sidebar Goal Click - Card Expansion', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    // Navigate to objective detail page
    const firstObjective = page.locator('[data-testid="objective-1"]').first();
    await firstObjective.click();
    await page.waitForURL(/\/objective\//);

    // Wait for Goals Overview to load
    await expect(page.locator('h2:has-text("Goals Overview")')).toBeVisible({ timeout: 10000 });
  });

  test('clicking goal in sidebar expands the goal card', async ({ page }) => {
    // Get sidebar (desktop)
    const sidebar = page.locator('aside').first();

    // Expand objective 1 in sidebar if not already expanded
    const objective = sidebar.locator('[data-testid="objective-1"]');
    const chevron = objective.locator('svg[class*="lucide-chevron"]');
    const chevronClass = await chevron.getAttribute('class');
    if (!chevronClass?.includes('rotate-90')) {
      await objective.click();
      await page.waitForTimeout(300);
    }

    // Find Level 1 goals in sidebar
    const goalButtons = sidebar.locator('button:has-text(/^1\\.\\d+\\s/)');
    const goalCount = await goalButtons.count();

    if (goalCount === 0) {
      test.skip();
      return;
    }

    // Click a Level 1 goal in sidebar
    await goalButtons.first().click();
    await page.waitForTimeout(500);

    // Verify card is expanded (close button visible)
    const closeButton = page.locator('button[aria-label="Collapse goal details"]');
    await expect(closeButton).toBeVisible({ timeout: 5000 });

    // Verify URL has hash
    const url = page.url();
    expect(url).toContain('#goal-');

    console.log('✓ Clicking goal in sidebar expands the goal card');
  });

  test('expanded card scrolls to center of viewport', async ({ page }) => {
    // Get viewport height
    const viewportHeight = 800;
    const viewportCenter = viewportHeight / 2;

    // Get sidebar and expand objective
    const sidebar = page.locator('aside').first();
    const objective = sidebar.locator('[data-testid="objective-1"]');
    const chevron = objective.locator('svg[class*="lucide-chevron"]');
    const chevronClass = await chevron.getAttribute('class');
    if (!chevronClass?.includes('rotate-90')) {
      await objective.click();
      await page.waitForTimeout(300);
    }

    // Find goals in sidebar
    const goalButtons = sidebar.locator('button:has-text(/^1\\.\\d+\\s/)');
    const goalCount = await goalButtons.count();

    if (goalCount <= 3) {
      console.log('Not enough goals to test scroll-to-center, skipping');
      test.skip();
      return;
    }

    // Click a goal that might be lower on the page
    const lowerGoal = goalButtons.nth(Math.min(5, goalCount - 1));
    await lowerGoal.click();

    // Wait for scroll and expansion animation
    await page.waitForTimeout(600);

    // Get the expanded card's bounding box
    const closeButton = page.locator('button[aria-label="Collapse goal details"]');
    await expect(closeButton).toBeVisible({ timeout: 5000 });

    // Find the expanded card container (parent of close button)
    const expandedCard = closeButton.locator('xpath=ancestor::div[contains(@id, "goal-card-")]');
    const box = await expandedCard.boundingBox();

    if (box) {
      // Card's vertical center should be within reasonable distance of viewport center
      const cardCenter = box.y + box.height / 2;
      const distanceFromCenter = Math.abs(cardCenter - viewportCenter);

      // Allow 300px tolerance (accounts for header, expansion animation, etc.)
      expect(distanceFromCenter).toBeLessThan(300);
      console.log(`✓ Expanded card is ${Math.round(distanceFromCenter)}px from viewport center`);
    } else {
      console.log('✓ Card expanded (bounding box not measurable)');
    }
  });

  test('URL hash persists and restores expansion state', async ({ page }) => {
    // Get sidebar and expand objective
    const sidebar = page.locator('aside').first();
    const objective = sidebar.locator('[data-testid="objective-1"]');
    const chevron = objective.locator('svg[class*="lucide-chevron"]');
    const chevronClass = await chevron.getAttribute('class');
    if (!chevronClass?.includes('rotate-90')) {
      await objective.click();
      await page.waitForTimeout(300);
    }

    // Click a goal in sidebar
    const goalButtons = sidebar.locator('button:has-text(/^1\\.\\d+\\s/)');
    if ((await goalButtons.count()) === 0) {
      test.skip();
      return;
    }
    await goalButtons.first().click();
    await page.waitForTimeout(500);

    // Verify expansion
    await expect(page.locator('button[aria-label="Collapse goal details"]')).toBeVisible();

    // Get the current URL with hash
    const currentUrl = page.url();
    expect(currentUrl).toContain('#goal-');

    // Navigate away
    await page.goto('/westside');
    await page.waitForLoadState('networkidle');

    // Navigate back to the saved URL
    await page.goto(currentUrl);
    await page.waitForLoadState('networkidle');

    // Card should be expanded again
    await expect(page.locator('button[aria-label="Collapse goal details"]')).toBeVisible({ timeout: 10000 });

    console.log('✓ URL hash persists and restores expansion state');
  });

  test('closing expanded card clears URL hash', async ({ page }) => {
    // Get sidebar and expand objective
    const sidebar = page.locator('aside').first();
    const objective = sidebar.locator('[data-testid="objective-1"]');
    const chevron = objective.locator('svg[class*="lucide-chevron"]');
    const chevronClass = await chevron.getAttribute('class');
    if (!chevronClass?.includes('rotate-90')) {
      await objective.click();
      await page.waitForTimeout(300);
    }

    // Click a goal to expand
    const goalButtons = sidebar.locator('button:has-text(/^1\\.\\d+\\s/)');
    if ((await goalButtons.count()) === 0) {
      test.skip();
      return;
    }
    await goalButtons.first().click();
    await page.waitForTimeout(500);

    // Verify hash exists
    let url = page.url();
    expect(url).toContain('#goal-');

    // Close the card
    const closeButton = page.locator('button[aria-label="Collapse goal details"]');
    await closeButton.click();
    await page.waitForTimeout(300);

    // Hash should be cleared
    url = page.url();
    expect(url).not.toContain('#goal-');

    console.log('✓ Closing expanded card clears URL hash');
  });

  test('clicking different goal in sidebar switches expansion', async ({ page }) => {
    // Get sidebar and expand objective
    const sidebar = page.locator('aside').first();
    const objective = sidebar.locator('[data-testid="objective-1"]');
    const chevron = objective.locator('svg[class*="lucide-chevron"]');
    const chevronClass = await chevron.getAttribute('class');
    if (!chevronClass?.includes('rotate-90')) {
      await objective.click();
      await page.waitForTimeout(300);
    }

    // Find goals in sidebar
    const goalButtons = sidebar.locator('button:has-text(/^1\\.\\d+\\s/)');
    const goalCount = await goalButtons.count();

    if (goalCount < 2) {
      console.log('Not enough goals to test switching');
      test.skip();
      return;
    }

    // Click first goal
    await goalButtons.nth(0).click();
    await page.waitForTimeout(500);

    // Verify one card expanded
    await expect(page.locator('button[aria-label="Collapse goal details"]')).toHaveCount(1);

    // Click second goal
    await goalButtons.nth(1).click();
    await page.waitForTimeout(500);

    // Should still have exactly one expanded card (switched)
    await expect(page.locator('button[aria-label="Collapse goal details"]')).toHaveCount(1);

    console.log('✓ Clicking different goal in sidebar switches expansion');
  });

  test('clicking goal card directly also expands and sets hash', async ({ page }) => {
    // Find a goal card in the grid
    const goalCard = page.locator('button[aria-label*="Goal"]').first();
    await expect(goalCard).toBeVisible({ timeout: 5000 });

    // Click the goal card directly
    await goalCard.click();
    await page.waitForTimeout(500);

    // Verify expansion
    await expect(page.locator('button[aria-label="Collapse goal details"]')).toBeVisible();

    // Verify URL has hash
    const url = page.url();
    expect(url).toContain('#goal-');

    console.log('✓ Clicking goal card directly also expands and sets hash');
  });
});

test.describe('Sidebar Goal Click - Mobile Behavior', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X dimensions

  test('clicking goal in mobile sidebar opens bottom sheet (not inline expansion)', async ({ page }) => {
    // Navigate to westside
    await page.goto('/westside');
    await page.waitForLoadState('networkidle');

    // On mobile, objectives are shown as cards with "View details" links
    const viewDetailsLink = page.locator('text=View details').first();
    await expect(viewDetailsLink).toBeVisible({ timeout: 15000 });
    await viewDetailsLink.click();

    // Wait for navigation
    await page.waitForURL(/\/objective\//);
    await page.waitForLoadState('networkidle');

    // Wait for goal cards to load
    const goalCard = page.locator('button[aria-label*="Goal"]').first();
    await expect(goalCard).toBeVisible({ timeout: 10000 });

    // Tap the goal card (mobile behavior)
    await goalCard.click();
    await page.waitForTimeout(500);

    // Should show bottom sheet modal, not inline expansion
    const bottomSheet = page.locator('[role="dialog"]');
    await expect(bottomSheet).toBeVisible({ timeout: 5000 });

    // Should NOT show inline close button (desktop expansion)
    const inlineCloseButton = page.locator('button[aria-label="Collapse goal details"]');
    await expect(inlineCloseButton).not.toBeVisible();

    console.log('✓ Mobile: tapping goal opens bottom sheet, not inline expansion');
  });

  test('mobile sidebar goal click opens bottom sheet', async ({ page }) => {
    // Navigate via mobile
    await page.goto('/westside');
    await page.waitForLoadState('networkidle');

    // Click "View details" to go to objective detail
    const viewDetailsLink = page.locator('text=View details').first();
    await expect(viewDetailsLink).toBeVisible({ timeout: 15000 });
    await viewDetailsLink.click();

    await page.waitForURL(/\/objective\//);
    await page.waitForLoadState('networkidle');

    // Open mobile sidebar/menu
    const menuButton = page.locator('button[aria-label*="menu"]').or(page.locator('[aria-label="Open menu"]')).or(page.locator('button:has(svg[class*="menu"])'));
    if (await menuButton.count() > 0) {
      await menuButton.first().click();
      await page.waitForTimeout(300);

      // Wait for sidebar to be visible
      const mobileSidebar = page.locator('aside.translate-x-0');
      if (await mobileSidebar.count() > 0) {
        // Find and click a goal in sidebar
        const goalButton = mobileSidebar.locator('button:has-text(/^1\\.\\d+\\s/)').first();
        if (await goalButton.count() > 0) {
          await goalButton.click();
          await page.waitForTimeout(500);

          // Should show bottom sheet modal
          const bottomSheet = page.locator('[role="dialog"]');
          await expect(bottomSheet).toBeVisible({ timeout: 5000 });

          console.log('✓ Mobile sidebar goal click opens bottom sheet');
        } else {
          console.log('⚠ No Level 1 goals found in mobile sidebar');
        }
      } else {
        console.log('⚠ Mobile sidebar not visible after menu click');
      }
    } else {
      console.log('⚠ Menu button not found, skipping mobile sidebar test');
    }
  });
});
