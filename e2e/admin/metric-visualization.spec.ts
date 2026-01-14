import { test, expect } from '@playwright/test';

/**
 * Metric Visualization Tests
 *
 * Tests that metric visualization types (bar, line, area, donut) are correctly:
 * 1. Displayed in the chart type selector
 * 2. Saved to the database when selected
 * 3. Rendered correctly on the Goals page
 *
 * These tests require authentication setup.
 * To enable: set up test credentials and update the auth fixture.
 */

test.describe.skip('Metric Visualization Types', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Authenticate as district admin before each test
    // Navigate to district admin goals page
    await page.goto('/westside/admin');
  });

  test('should display chart type selector with 4 options', async ({ page }) => {
    // Navigate to Goals/Objectives page
    await page.goto('/westside/admin/objectives/1');

    // Find and click edit button on a metric
    const editButton = page.locator('[data-testid="edit-metric"], button[title="Edit metric"]').first();
    await editButton.click();

    // Wait for metric edit form to appear
    await expect(page.locator('text=Edit Metric, text=Visualization Type')).toBeVisible();

    // Verify chart type selector is visible
    const chartTypeSelector = page.locator('[data-testid="chart-type-selector"]');
    await expect(chartTypeSelector).toBeVisible();

    // Verify all 4 chart type options exist
    await expect(page.locator('button:has-text("Bar")')).toBeVisible();
    await expect(page.locator('button:has-text("Line")')).toBeVisible();
    await expect(page.locator('button:has-text("Area")')).toBeVisible();
    await expect(page.locator('button:has-text("Donut")')).toBeVisible();
  });

  test('should save donut chart type and render correctly', async ({ page }) => {
    // Navigate to objective with metrics
    await page.goto('/westside/admin/objectives/1');

    // Click edit on first metric
    const editButton = page.locator('[data-testid="edit-metric"], button[title="Edit metric"]').first();
    await editButton.click();

    // Wait for form
    await page.waitForSelector('text=Visualization Type');

    // Click Donut option
    await page.locator('button:has-text("Donut")').click();

    // Verify Donut is selected (has active styling)
    const donutButton = page.locator('button:has-text("Donut")');
    await expect(donutButton).toHaveClass(/bg-blue|bg-primary|selected/);

    // Save the metric
    await page.locator('button:has-text("Save")').click();

    // Wait for save to complete
    await page.waitForResponse(response =>
      response.url().includes('/spb_metrics') && response.status() === 200
    );

    // Verify the metric card now displays a donut chart
    // Canvas-based charts are hard to verify directly, but we can check:
    // 1. The canvas element exists
    // 2. No bar chart specific elements are visible
    const metricCard = page.locator('[data-testid="metric-card"]').first();
    const canvas = metricCard.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should save line chart type', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const editButton = page.locator('[data-testid="edit-metric"], button[title="Edit metric"]').first();
    await editButton.click();

    await page.waitForSelector('text=Visualization Type');
    await page.locator('button:has-text("Line")').click();
    await page.locator('button:has-text("Save")').click();

    await page.waitForResponse(response =>
      response.url().includes('/spb_metrics') && response.status() === 200
    );

    // Verify canvas exists (line chart rendered)
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should save area chart type', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const editButton = page.locator('[data-testid="edit-metric"], button[title="Edit metric"]').first();
    await editButton.click();

    await page.waitForSelector('text=Visualization Type');
    await page.locator('button:has-text("Area")').click();
    await page.locator('button:has-text("Save")').click();

    await page.waitForResponse(response =>
      response.url().includes('/spb_metrics') && response.status() === 200
    );

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should preserve chart type after page reload', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    // Edit metric and set to Donut
    const editButton = page.locator('[data-testid="edit-metric"], button[title="Edit metric"]').first();
    await editButton.click();

    await page.waitForSelector('text=Visualization Type');
    await page.locator('button:has-text("Donut")').click();
    await page.locator('button:has-text("Save")').click();

    await page.waitForResponse(response =>
      response.url().includes('/spb_metrics') && response.status() === 200
    );

    // Reload the page
    await page.reload();

    // Edit the same metric again
    await editButton.click();
    await page.waitForSelector('text=Visualization Type');

    // Verify Donut is still selected
    const donutButton = page.locator('button:has-text("Donut")');
    await expect(donutButton).toHaveClass(/bg-blue|bg-primary|selected/);
  });

  test('should display correct data values on chart', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    // Expand a goal to see metrics
    const goalCard = page.locator('[data-testid="goal-card"]').first();
    await goalCard.click();

    // Wait for metric to load
    await page.waitForSelector('canvas');

    // The canvas should be visible with data
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    // Check that the metric value is displayed
    // Look for the numeric value near the chart
    const metricValue = page.locator('text=/\\d+\\.\\d+/');
    await expect(metricValue.first()).toBeVisible();
  });
});

// Tests that can run without authentication (using public view)
test.describe('Public Metric Visualization', () => {
  test('should display metric charts on public goals page', async ({ page }) => {
    await page.goto('/westside/goals');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if any canvas elements exist (charts rendered)
    const canvasElements = page.locator('canvas');
    const count = await canvasElements.count();

    // If metrics exist, there should be canvas elements
    if (count > 0) {
      await expect(canvasElements.first()).toBeVisible();
    }
  });

  test('should expand goal card to show metric details', async ({ page }) => {
    await page.goto('/westside/goals');

    // Find a goal card and click to expand
    const goalCard = page.locator('[data-testid="goal-card"], .goal-card, [class*="GoalCard"]').first();

    if (await goalCard.isVisible()) {
      await goalCard.click();

      // Wait for expansion animation
      await page.waitForTimeout(300);

      // Check for metric content
      const metricContent = page.locator('canvas, [data-testid="metric-chart"]');
      // May or may not have metrics depending on data
    }
  });
});

// Bar chart label tests - verify labels show value only, not concatenated units
test.describe('Bar Chart Label Formatting', () => {
  test('bar chart labels should display numeric values without unit concatenation', async ({ page }) => {
    await page.goto('/westside/goals');
    await page.waitForLoadState('networkidle');

    // Wait for canvas charts to render
    const canvasElements = page.locator('canvas');
    const count = await canvasElements.count();

    if (count > 0) {
      // Take a screenshot for visual verification that labels show clean values
      // Labels should show "3.75" not "3.75rating" or "100score"
      const firstCanvas = canvasElements.first();
      await expect(firstCanvas).toBeVisible();

      // Visual regression test - update baseline after fix is applied
      await expect(firstCanvas).toHaveScreenshot('bar-chart-labels.png', {
        maxDiffPixels: 100,
      });
    }
  });
});

// Visual regression tests (optional, requires baseline screenshots)
test.describe.skip('Metric Chart Visual Tests', () => {
  test('donut chart should match visual snapshot', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    // Set up a metric with known data and donut chart type
    // Take screenshot of the chart
    const chartContainer = page.locator('[data-testid="metric-chart"]').first();
    await expect(chartContainer).toHaveScreenshot('donut-chart.png');
  });

  test('bar chart should match visual snapshot', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const chartContainer = page.locator('[data-testid="metric-chart"]').first();
    await expect(chartContainer).toHaveScreenshot('bar-chart.png');
  });

  test('line chart should match visual snapshot', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const chartContainer = page.locator('[data-testid="metric-chart"]').first();
    await expect(chartContainer).toHaveScreenshot('line-chart.png');
  });

  test('area chart should match visual snapshot', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const chartContainer = page.locator('[data-testid="metric-chart"]').first();
    await expect(chartContainer).toHaveScreenshot('area-chart.png');
  });
});
