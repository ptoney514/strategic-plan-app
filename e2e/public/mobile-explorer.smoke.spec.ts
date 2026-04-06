import { test, expect } from '@playwright/test';

test.describe('Public mobile explorer smoke', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('supports mobile menu navigation without horizontal overflow', async ({ page }) => {
    await page.goto('/district/westside');
    await page.waitForSelector('[data-testid="public-mobile-menu-button"]', {
      state: 'visible',
      timeout: 15000,
    });
    await page.waitForSelector('[data-testid="objective-card-1"]', {
      state: 'visible',
      timeout: 15000,
    });

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.getByTestId('public-mobile-menu-button').click();
    await expect(page.getByTestId('public-mobile-sidebar')).toBeVisible();

    await page.getByRole('button', { name: /close navigation menu/i }).click();
    await expect(page.getByTestId('public-mobile-sidebar')).toHaveCount(0);

    await page.getByTestId('objective-card-1').click();
    await expect(page).toHaveURL(/\/district\/westside\/objectives\//);

    const goalCard = page.locator('[data-testid^="objective-goal-card-"]').first();
    await expect(goalCard).toBeVisible();
    await goalCard.click();

    await expect(page).toHaveURL(/\/district\/westside\/goals\//);
    await expect(page.getByTestId('goal-detail-back-link')).toBeVisible();
  });
});
