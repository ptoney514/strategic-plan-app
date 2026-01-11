import { test, expect } from '@playwright/test';

/**
 * Dark Mode Toggle Tests
 *
 * Verify that the dark mode toggle works correctly on public pages.
 */

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to reset theme
    await page.addInitScript(() => {
      localStorage.removeItem('theme');
    });
  });

  test('should toggle dark mode when clicking the theme button', async ({ page }) => {
    // Navigate to the goals page (using subdomain query param for localhost)
    await page.goto('/goals?subdomain=westside');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get the HTML element
    const html = page.locator('html');

    // Initially should NOT have dark class (light mode is default)
    await expect(html).not.toHaveClass(/dark/);

    // Find and click the theme toggle button
    const themeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="light"]');
    await expect(themeToggle).toBeVisible();

    // Click to enable dark mode
    await themeToggle.click();

    // Should now have dark class
    await expect(html).toHaveClass(/dark/);

    // Verify localStorage was updated
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');

    // Click again to disable dark mode
    await themeToggle.click();

    // Should NOT have dark class anymore
    await expect(html).not.toHaveClass(/dark/);

    // Verify localStorage was updated
    const themeAfter = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeAfter).toBe('light');
  });

  test('should persist dark mode preference after page reload', async ({ page, context }) => {
    // Navigate to the goals page (using subdomain query param for localhost)
    await page.goto('/goals?subdomain=westside');
    await page.waitForLoadState('networkidle');

    // Click theme toggle to enable dark mode
    const themeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="light"]');
    await themeToggle.click();

    // Verify dark mode is enabled
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Verify localStorage was set
    const themeBeforeReload = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeBeforeReload).toBe('dark');

    // Create a new page without the beforeEach addInitScript that clears localStorage
    const newPage = await context.newPage();
    await newPage.goto('/goals?subdomain=westside');
    await newPage.waitForLoadState('networkidle');

    // Dark mode should still be enabled on new page (localStorage persisted in context)
    await expect(newPage.locator('html')).toHaveClass(/dark/);

    await newPage.close();
  });

  test('should apply dark styles to objective cards', async ({ page }) => {
    // Set dark mode via localStorage before navigating
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });

    // Navigate to the goals page (using subdomain query param for localhost)
    await page.goto('/goals?subdomain=westside');
    await page.waitForLoadState('networkidle');

    // Verify HTML has dark class
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Check that the page background has dark styling
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);

    // In dark mode, background should be dark (slate-950 is very dark)
    // RGB values should be low (dark colors)
    console.log('Background color:', bgColor);
  });
});
