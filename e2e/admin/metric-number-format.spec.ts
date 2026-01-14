import { test, expect } from '@playwright/test';

/**
 * Metric Number Format Tests
 *
 * Tests that metric number format (whole, decimal, percentage) are correctly:
 * 1. Saved to the database when selected
 * 2. Rendered correctly without % when "Whole Number" is selected
 * 3. Persisted after page reload
 *
 * These tests require authentication setup.
 * To enable: set up test credentials and update the auth fixture.
 */

test.describe.skip('Metric Number Format - Admin', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Authenticate as district admin before each test
    await page.goto('/westside/admin');
  });

  test('should display number format selector in metric edit form', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    // Find and click edit button on a metric
    const editButton = page.locator('button[title="Edit metric"]').first();
    await editButton.click();

    // Wait for metric edit form to appear
    await expect(page.locator('text=Number Format')).toBeVisible();

    // Verify format dropdown exists
    const formatDropdown = page.locator('select').filter({ hasText: /Whole Number|Decimal|Percentage/ });
    await expect(formatDropdown).toBeVisible();
  });

  test('should save whole number format and display without percentage sign', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    // Click edit on a metric
    const editButton = page.locator('button[title="Edit metric"]').first();
    await editButton.click();

    // Wait for form
    await page.waitForSelector('text=Number Format');

    // Select "Whole Number" format
    await page.locator('select').filter({ hasText: /Whole Number|Decimal|Percentage/ }).selectOption('whole');

    // Save the metric
    await page.locator('button:has-text("Save")').click();

    // Wait for save to complete
    await page.waitForResponse(response =>
      response.url().includes('/spb_metrics') && response.status() === 200
    );

    // Wait for form to close and card to update
    await page.waitForTimeout(500);

    // Verify the metric card displays value WITHOUT % sign
    // Look for the large value display (should be a number without %)
    const metricValue = page.locator('.text-5xl, .text-4xl, .text-3xl').first();
    const valueText = await metricValue.textContent();

    // The value should NOT contain a % sign
    expect(valueText).not.toContain('%');
  });

  test('should save percentage format and display with percentage sign', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const editButton = page.locator('button[title="Edit metric"]').first();
    await editButton.click();

    await page.waitForSelector('text=Number Format');

    // Select "Percentage" format
    await page.locator('select').filter({ hasText: /Whole Number|Decimal|Percentage/ }).selectOption('percentage');

    await page.locator('button:has-text("Save")').click();

    await page.waitForResponse(response =>
      response.url().includes('/spb_metrics') && response.status() === 200
    );

    await page.waitForTimeout(500);

    // Verify the metric card displays value WITH % sign
    const metricValue = page.locator('.text-5xl, .text-4xl, .text-3xl').first();
    const valueText = await metricValue.textContent();

    expect(valueText).toContain('%');
  });

  test('should save decimal format with correct decimal places', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const editButton = page.locator('button[title="Edit metric"]').first();
    await editButton.click();

    await page.waitForSelector('text=Number Format');

    // Select "Decimal" format
    await page.locator('select').filter({ hasText: /Whole Number|Decimal|Percentage/ }).selectOption('decimal');

    // Set decimal places to 2
    const decimalInput = page.locator('select').filter({ hasText: /0|1|2|3|4/ }).last();
    await decimalInput.selectOption('2');

    await page.locator('button:has-text("Save")').click();

    await page.waitForResponse(response =>
      response.url().includes('/spb_metrics') && response.status() === 200
    );

    await page.waitForTimeout(500);

    // Verify the metric card displays value with decimals but no %
    const metricValue = page.locator('.text-5xl, .text-4xl, .text-3xl').first();
    const valueText = await metricValue.textContent();

    // Should have decimal point but no %
    expect(valueText).toContain('.');
    expect(valueText).not.toContain('%');
  });

  test('should preserve number format after page reload', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    // Edit metric and set to Whole Number
    const editButton = page.locator('button[title="Edit metric"]').first();
    await editButton.click();

    await page.waitForSelector('text=Number Format');
    await page.locator('select').filter({ hasText: /Whole Number|Decimal|Percentage/ }).selectOption('whole');
    await page.locator('button:has-text("Save")').click();

    await page.waitForResponse(response =>
      response.url().includes('/spb_metrics') && response.status() === 200
    );

    // Reload the page
    await page.reload();

    // Edit the same metric again
    await editButton.click();
    await page.waitForSelector('text=Number Format');

    // Verify "Whole Number" is still selected
    const formatDropdown = page.locator('select').filter({ hasText: /Whole Number|Decimal|Percentage/ });
    await expect(formatDropdown).toHaveValue('whole');
  });
});

// Tests that can run without authentication (using public view)
test.describe('Metric Number Format - Public View', () => {
  test('should display metric values on public goals page', async ({ page }) => {
    await page.goto('/westside/goals');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if any metric values are displayed
    // Look for large numeric values (the main value display)
    const metricValues = page.locator('.text-5xl, .text-4xl, .text-3xl');
    const count = await metricValues.count();

    if (count > 0) {
      // At least one metric value should be visible
      await expect(metricValues.first()).toBeVisible();
    }
  });

  test('should show metric charts without errors', async ({ page }) => {
    await page.goto('/westside/goals');

    await page.waitForLoadState('networkidle');

    // Check for any JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(1000);

    // Should not have any critical errors
    const criticalErrors = errors.filter(e =>
      e.includes('formatMetricValue') || e.includes('TypeError')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

// Visual regression tests for number formats
test.describe.skip('Metric Number Format Visual Tests', () => {
  test('whole number format should display without decimal or %', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    // Set up a metric with whole number format
    // Take screenshot of the metric card
    const metricCard = page.locator('[data-testid="metric-card"]').first();
    await expect(metricCard).toHaveScreenshot('whole-number-format.png');
  });

  test('percentage format should display with % suffix', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const metricCard = page.locator('[data-testid="metric-card"]').first();
    await expect(metricCard).toHaveScreenshot('percentage-format.png');
  });

  test('decimal format should display with decimal places', async ({ page }) => {
    await page.goto('/westside/admin/objectives/1');

    const metricCard = page.locator('[data-testid="metric-card"]').first();
    await expect(metricCard).toHaveScreenshot('decimal-format.png');
  });
});
