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

  test('uses the mobile shell and stacked detail layouts on narrow tablets', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 1180 });

    await page.goto('/district/westside');
    await page.waitForSelector('[data-testid="public-mobile-menu-button"]', {
      state: 'visible',
      timeout: 15000,
    });

    await expect(page.getByTestId('public-mobile-topbar')).toBeVisible();
    await expect(page.getByTestId('public-desktop-sidebar')).toBeHidden();

    await page.getByTestId('public-mobile-menu-button').click();
    await expect(page.getByTestId('public-mobile-sidebar')).toBeVisible();
    await page.getByRole('button', { name: /close navigation menu/i }).click();

    await page.getByTestId('objective-card-1').click();
    await expect(page).toHaveURL(/\/district\/westside\/objectives\//);

    const objectiveCards = page.locator('[data-testid^="objective-goal-card-"]');
    await expect(objectiveCards.nth(1)).toBeVisible();

    const objectiveCardOne = await objectiveCards.nth(0).boundingBox();
    const objectiveCardTwo = await objectiveCards.nth(1).boundingBox();

    expect(objectiveCardOne).not.toBeNull();
    expect(objectiveCardTwo).not.toBeNull();
    expect(Math.abs(objectiveCardOne!.x - objectiveCardTwo!.x)).toBeLessThan(8);
    expect(objectiveCardTwo!.y).toBeGreaterThan(objectiveCardOne!.y + 16);

    const widgetHeavyGoalCard = page.getByTestId('objective-goal-card-1.5');
    await expect(widgetHeavyGoalCard).toBeVisible();
    await widgetHeavyGoalCard.scrollIntoViewIfNeeded();
    await widgetHeavyGoalCard.click();
    await expect(page).toHaveURL(/\/district\/westside\/goals\//);

    const firstWidgetCard = page.locator('[data-widget-grid-variant="public-detail"] [data-testid^="widget-card-"]').first();
    await expect(firstWidgetCard).toBeVisible();

    const widgetCardBox = await firstWidgetCard.boundingBox();
    expect(widgetCardBox).not.toBeNull();
    expect(widgetCardBox!.width).toBeGreaterThan(600);
  });
});
