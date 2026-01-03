import { test, expect } from '@playwright/test';

test('clicking objective should navigate to objective detail page', async ({ page }) => {
  await page.goto('/westside');
  await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

  // Click first objective
  const firstObjective = page.locator('[data-testid="objective-1"]').first();
  await firstObjective.click();

  // Wait for navigation
  await page.waitForTimeout(500);

  // Should be on objective detail page
  await expect(page).toHaveURL(/\/westside\/objective\//);

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

  // Should show "Goals" section header
  await expect(page.locator('h2:has-text("Goals")')).toBeVisible({ timeout: 5000 });

  // Should show at least one goal card with a link
  const goalCard = page.locator('a[href*="/goal/"]').first();
  await expect(goalCard).toBeVisible({ timeout: 5000 });

  console.log('✓ Objective detail page shows goals section!');
});

test('clicking goal card should navigate to goal detail', async ({ page }) => {
  await page.goto('/westside');
  await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

  // Click first objective
  const firstObjective = page.locator('[data-testid="objective-1"]').first();
  await firstObjective.click();
  await page.waitForTimeout(500);

  // Click first goal card
  const goalCard = page.locator('a[href*="/goal/"]').first();
  await goalCard.click();

  // Wait for navigation
  await page.waitForTimeout(500);

  // Should be on goal detail page
  await expect(page).toHaveURL(/\/westside\/goal\//);

  console.log('✓ Goal card navigation works!');
});
