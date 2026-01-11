import { test, expect } from '@playwright/test';

test('clicking objective should navigate to objective detail page', async ({ page }) => {
  await page.goto('/westside');
  await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

  // Click first objective
  const firstObjective = page.locator('[data-testid="objective-1"]').first();
  await firstObjective.click();

  // Wait for navigation
  await page.waitForTimeout(500);

  // Should be on objective detail page (URL may or may not include district slug)
  await expect(page).toHaveURL(/\/objective\//);

  // Should show status badge (On Target, Needs Attention, etc.)
  const statusBadge = page.locator('text=/On Target|Needs Attention|Off Track|Not Started/').first();
  await expect(statusBadge).toBeVisible({ timeout: 5000 });

  console.log('✓ Objective navigation works!');
});

test('objective detail page should show goals section', async ({ page }) => {
  await page.goto('/westside');
  await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

  // Click first objective
  const firstObjective = page.locator('[data-testid="objective-1"]').first();
  await firstObjective.click();

  // Wait for navigation
  await page.waitForTimeout(500);

  // Should show "Goals Overview" section header
  await expect(page.locator('h2:has-text("Goals Overview")')).toBeVisible({ timeout: 5000 });

  // Should show at least one goal card (now using compact cards with expand functionality)
  const goalCard = page.locator('button[aria-label*="Goal"]').first();
  await expect(goalCard).toBeVisible({ timeout: 5000 });

  console.log('✓ Objective detail page shows goals section!');
});

test('clicking goal card should expand to show details', async ({ page }) => {
  await page.goto('/westside');
  await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

  // Click first objective
  const firstObjective = page.locator('[data-testid="objective-1"]').first();
  await firstObjective.click();
  await page.waitForTimeout(500);

  // Click first goal card (compact card)
  const goalCard = page.locator('button[aria-label*="Goal"]').first();
  await goalCard.click();

  // Wait for expansion animation
  await page.waitForTimeout(300);

  // Should show expanded panel with close button
  const closeButton = page.locator('button[aria-label="Collapse goal details"]');
  await expect(closeButton).toBeVisible({ timeout: 5000 });

  console.log('✓ Goal card expand functionality works!');
});
