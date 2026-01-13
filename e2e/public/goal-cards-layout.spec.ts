import { test, expect } from '@playwright/test';

test.describe('Goal Cards Layout - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    // Navigate to an objective detail page
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    // Click first objective to navigate to detail page
    const firstObjective = page.locator('[data-testid="objective-1"]').first();
    await firstObjective.click();
    await page.waitForTimeout(500);

    // Verify we're on the objective detail page
    await expect(page).toHaveURL(/\/objective\//);
  });

  test('all goal cards have consistent height', async ({ page }) => {
    // Wait for goal cards to be visible
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 5000 });

    const cardCount = await goalCards.count();
    if (cardCount < 2) {
      test.skip();
      return;
    }

    // Get bounding boxes of all cards
    const heights: number[] = [];
    for (let i = 0; i < Math.min(cardCount, 6); i++) {
      const box = await goalCards.nth(i).boundingBox();
      if (box) {
        heights.push(box.height);
      }
    }

    // All cards should have the same height (within 6px tolerance for minor rendering differences)
    const firstHeight = heights[0];
    for (let i = 1; i < heights.length; i++) {
      expect(Math.abs(heights[i] - firstHeight)).toBeLessThanOrEqual(6);
    }

    console.log(`✓ All ${heights.length} goal cards have consistent height (~${Math.round(firstHeight)}px)`);
  });

  test('goal card titles have min-height class for 3-line consistency', async ({ page }) => {
    // Wait for goal cards to be visible
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 5000 });

    // Check the h3 title element has min-h class
    const title = goalCards.first().locator('h3');
    await expect(title).toBeVisible();

    // Verify the title has line-clamp-3 for truncation
    const classes = await title.getAttribute('class');
    expect(classes).toContain('line-clamp-3');
    expect(classes).toContain('min-h-');

    console.log('✓ Goal card titles have min-height and line-clamp-3 classes');
  });

  test('short titles render with same card height as longer titles', async ({ page }) => {
    // Wait for goal cards to be visible
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 5000 });

    const cardCount = await goalCards.count();
    if (cardCount < 2) {
      test.skip();
      return;
    }

    // Get heights of multiple cards (some may have short, some long titles)
    const heights: number[] = [];
    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      const box = await goalCards.nth(i).boundingBox();
      if (box) {
        heights.push(box.height);
      }
    }

    // Calculate variance in heights - should be minimal
    const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
    const maxVariance = Math.max(...heights.map(h => Math.abs(h - avgHeight)));

    // Allow 2px variance for anti-aliasing/rounding
    expect(maxVariance).toBeLessThanOrEqual(2);

    console.log(`✓ Cards have consistent height with max variance of ${maxVariance.toFixed(1)}px`);
  });

  test('long titles are truncated with ellipsis', async ({ page }) => {
    // Wait for goal cards to be visible
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 5000 });

    // The title element should have line-clamp-3 which adds text-overflow: ellipsis
    const title = goalCards.first().locator('h3');
    const classes = await title.getAttribute('class');

    // line-clamp-3 Tailwind class handles the truncation
    expect(classes).toContain('line-clamp-3');

    console.log('✓ Long titles are truncated via line-clamp-3');
  });

  test('desktop shows 3-column grid layout', async ({ page }) => {
    // Wait for goal cards to be visible
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 5000 });

    const cardCount = await goalCards.count();
    if (cardCount < 3) {
      test.skip();
      return;
    }

    // Get positions of first 3 cards
    const positions = [];
    for (let i = 0; i < 3; i++) {
      const box = await goalCards.nth(i).boundingBox();
      if (box) {
        positions.push({ x: box.x, y: box.y });
      }
    }

    // In a 3-column grid, first 3 cards should be on the same row (same y)
    // with increasing x positions
    expect(positions[0].y).toBe(positions[1].y);
    expect(positions[1].y).toBe(positions[2].y);
    expect(positions[0].x).toBeLessThan(positions[1].x);
    expect(positions[1].x).toBeLessThan(positions[2].x);

    console.log('✓ Desktop displays 3-column grid layout');
  });
});

test.describe('Goal Cards Layout - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X dimensions

  test.beforeEach(async ({ page }) => {
    // Navigate to objective detail
    await page.goto('/westside');
    await page.waitForLoadState('networkidle');

    // On mobile, click "View details" link to navigate to objective detail
    const viewDetailsLink = page.locator('text=View details').first();
    await expect(viewDetailsLink).toBeVisible({ timeout: 15000 });
    await viewDetailsLink.click();

    // Wait for navigation
    await page.waitForURL(/\/objective\//);
    await page.waitForLoadState('networkidle');
  });

  test('mobile: goal cards have consistent height', async ({ page }) => {
    // Wait for goal cards to be visible
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 10000 });

    const cardCount = await goalCards.count();
    if (cardCount < 2) {
      test.skip();
      return;
    }

    // Get heights of cards
    const heights: number[] = [];
    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      const box = await goalCards.nth(i).boundingBox();
      if (box) {
        heights.push(box.height);
      }
    }

    // All cards should have the same height (within 2px tolerance)
    const firstHeight = heights[0];
    for (let i = 1; i < heights.length; i++) {
      expect(Math.abs(heights[i] - firstHeight)).toBeLessThanOrEqual(2);
    }

    console.log(`✓ Mobile: All ${heights.length} goal cards have consistent height (~${Math.round(firstHeight)}px)`);
  });

  test('mobile: shows single column layout', async ({ page }) => {
    // Wait for goal cards to be visible
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 10000 });

    const cardCount = await goalCards.count();
    if (cardCount < 2) {
      test.skip();
      return;
    }

    // Get positions of first 2 cards
    const box1 = await goalCards.nth(0).boundingBox();
    const box2 = await goalCards.nth(1).boundingBox();

    if (box1 && box2) {
      // In single column layout, cards should be stacked vertically
      // Same x position, different y positions
      expect(Math.abs(box1.x - box2.x)).toBeLessThanOrEqual(5); // Same x (with small tolerance)
      expect(box2.y).toBeGreaterThan(box1.y); // Second card below first
    }

    console.log('✓ Mobile displays single column layout');
  });

  test('mobile: title truncation works correctly', async ({ page }) => {
    // Wait for goal cards to be visible
    const goalCards = page.locator('button[aria-label*="Goal"]');
    await expect(goalCards.first()).toBeVisible({ timeout: 10000 });

    // Check the h3 title element has correct classes
    const title = goalCards.first().locator('h3');
    await expect(title).toBeVisible();

    const classes = await title.getAttribute('class');
    expect(classes).toContain('line-clamp-3');
    expect(classes).toContain('min-h-');

    console.log('✓ Mobile: Title truncation classes applied correctly');
  });
});
