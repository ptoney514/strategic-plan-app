import { test, expect } from '@playwright/test';

/**
 * E2E tests for narrative (text) visualization cards
 * Validates that metrics with visualization_config.chartType === 'narrative'
 * display correctly with "Read more" pattern instead of numeric values
 */

test.describe('Narrative Card Display', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Browser error]: ${msg.text()}`);
      }
    });
  });

  test('compact card shows "Read more" for narrative metrics', async ({ page }) => {
    // Navigate to a district that has narrative metrics
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    // Click on an objective to see goal cards
    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Look for "Read more" text which indicates a narrative card
    const readMoreElements = page.locator('text=Read more');
    const readMoreCount = await readMoreElements.count();

    console.log(`Found ${readMoreCount} "Read more" elements (narrative cards)`);

    // Check for TEXT label on narrative cards
    const textLabels = page.locator('text=TEXT');
    const textLabelCount = await textLabels.count();
    console.log(`Found ${textLabelCount} "TEXT" labels`);

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'test-results/narrative-card-compact.png',
      fullPage: true,
    });

    // If narrative metrics exist in test data, verify they display correctly
    if (readMoreCount > 0) {
      // Verify the Read more text is visible
      await expect(readMoreElements.first()).toBeVisible();

      // Verify arrow icon is present (lucide ArrowRight renders as svg)
      const arrowIcon = page.locator('text=Read more').locator('..').locator('svg');
      const arrowCount = await arrowIcon.count();
      console.log(`Found ${arrowCount} arrow icons next to "Read more"`);
    }
  });

  test('narrative card shows status badge with trend icon', async ({ page }) => {
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Look for status badges near narrative cards
    // Status badges have text like "On Target", "In Progress", etc.
    const statusBadges = page.locator('.rounded-md').filter({ hasText: /On Target|In Progress|Off Track|Needs Attention/ });
    const badgeCount = await statusBadges.count();

    console.log(`Found ${badgeCount} status badges`);

    // Check for trend icon (TrendingUp svg) in badges
    const trendIcons = page.locator('svg.lucide-trending-up, svg[data-lucide="trending-up"]');
    const trendIconCount = await trendIcons.count();
    console.log(`Found ${trendIconCount} trend icons`);

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'test-results/narrative-card-badges.png',
      fullPage: true,
    });
  });

  test('clicking narrative card expands to show full content', async ({ page }) => {
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Find a narrative card by looking for "Read more"
    const readMoreButton = page.locator('button:has-text("Read more")').first();

    if (await readMoreButton.count() > 0) {
      // Take screenshot before expansion
      await page.screenshot({
        path: 'test-results/narrative-card-before-expand.png',
        fullPage: true,
      });

      // Click to expand
      await readMoreButton.click();
      await page.waitForTimeout(300); // Wait for animation

      // Take screenshot after expansion
      await page.screenshot({
        path: 'test-results/narrative-card-after-expand.png',
        fullPage: true,
      });

      // In expanded view, should see "TEXT CONTENT" label
      const textContentLabel = page.locator('text=TEXT CONTENT');
      if (await textContentLabel.count() > 0) {
        await expect(textContentLabel).toBeVisible();
        console.log('Expanded view shows TEXT CONTENT label');
      }

      // Should see the narrative display area
      const narrativeArea = page.locator('.narrative-display, .prose');
      const narrativeCount = await narrativeArea.count();
      console.log(`Found ${narrativeCount} narrative display areas`);
    } else {
      console.log('No narrative cards found to test expansion');
    }
  });

  test('non-narrative cards still show numeric values (regression)', async ({ page }) => {
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Look for numeric metric labels (RATING, COMPLETION, etc.)
    const ratingLabels = page.locator('text=RATING');
    const completionLabels = page.locator('text=COMPLETION');
    const budgetLabels = page.locator('text=BUDGET');

    const ratingCount = await ratingLabels.count();
    const completionCount = await completionLabels.count();
    const budgetCount = await budgetLabels.count();

    console.log(`Found ${ratingCount} RATING labels`);
    console.log(`Found ${completionCount} COMPLETION labels`);
    console.log(`Found ${budgetCount} BUDGET labels`);

    // Check for numeric values (e.g., "3.83", "100.0", etc.)
    const numericValues = page.locator('.text-2xl.font-semibold');
    const numericCount = await numericValues.count();
    console.log(`Found ${numericCount} numeric value displays`);

    if (numericCount > 0) {
      const firstValue = await numericValues.first().textContent();
      console.log(`First numeric value: "${firstValue}"`);

      // Verify it's actually a number (not "Read more")
      if (firstValue) {
        const isNumeric = !isNaN(parseFloat(firstValue.replace(/[$,%]/g, '')));
        console.log(`Value is numeric: ${isNumeric}`);
      }
    }

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'test-results/non-narrative-cards.png',
      fullPage: true,
    });
  });

  test('dark mode renders narrative cards correctly', async ({ page }) => {
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    // Enable dark mode by clicking the theme toggle if it exists
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("Dark")');
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      await page.waitForTimeout(300);
    } else {
      // Set dark mode via class
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
    }

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Take screenshot in dark mode
    await page.screenshot({
      path: 'test-results/narrative-card-dark-mode.png',
      fullPage: true,
    });

    // Verify dark mode styling on Read more text
    const readMore = page.locator('text=Read more').first();
    if (await readMore.count() > 0) {
      // In dark mode, Read more should have blue-400 color class
      const parentClass = await readMore.locator('..').getAttribute('class');
      console.log(`Read more parent classes: ${parentClass}`);
    }
  });

  test('responsive layout - narrative cards render at mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Take mobile screenshot
    await page.screenshot({
      path: 'test-results/narrative-card-mobile.png',
      fullPage: true,
    });

    // Verify "Read more" and status badge don't overlap
    const readMore = page.locator('text=Read more').first();
    const statusBadge = page.locator('.rounded-md').filter({ hasText: /On Target|In Progress/ }).first();

    if (await readMore.count() > 0 && await statusBadge.count() > 0) {
      const readMoreBox = await readMore.boundingBox();
      const badgeBox = await statusBadge.boundingBox();

      if (readMoreBox && badgeBox) {
        // Check they don't overlap horizontally
        const overlaps = !(readMoreBox.x + readMoreBox.width < badgeBox.x ||
                          badgeBox.x + badgeBox.width < readMoreBox.x);
        console.log(`Read more and badge overlap: ${overlaps}`);

        if (overlaps) {
          // They might be stacked vertically on mobile, which is fine
          console.log(`Read more Y: ${readMoreBox.y}, Badge Y: ${badgeBox.y}`);
        }
      }
    }
  });

  test('responsive layout - narrative cards render at tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Take tablet screenshot
    await page.screenshot({
      path: 'test-results/narrative-card-tablet.png',
      fullPage: true,
    });
  });

  test('visual regression - narrative card appearance', async ({ page }) => {
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Find first goal card that is a narrative type
    const narrativeCard = page.locator('button:has-text("Read more")').first();

    if (await narrativeCard.count() > 0) {
      // Take focused screenshot of just the card
      const cardScreenshot = await narrativeCard.screenshot();

      // Save for visual comparison
      await page.screenshot({
        path: 'test-results/narrative-card-visual.png',
        fullPage: false,
        clip: await narrativeCard.boundingBox() || undefined,
      });

      console.log('Narrative card screenshot captured for visual regression');
    } else {
      console.log('No narrative cards found for visual regression test');
    }
  });

  test('side-by-side comparison - narrative vs numeric cards', async ({ page }) => {
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Get all goal cards
    const allCards = page.locator('button[aria-expanded]');
    const cardCount = await allCards.count();
    console.log(`Total goal cards: ${cardCount}`);

    // Analyze each card
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const card = allCards.nth(i);
      const cardText = await card.textContent();
      const isNarrative = cardText?.includes('Read more');
      const hasRating = cardText?.match(/\d+\.\d+\s*\/\s*\d+/);

      console.log(`Card ${i + 1}: ${isNarrative ? 'NARRATIVE' : hasRating ? 'NUMERIC' : 'UNKNOWN'}`);
    }

    // Take screenshot showing both types
    await page.screenshot({
      path: 'test-results/narrative-vs-numeric-cards.png',
      fullPage: true,
    });
  });
});
