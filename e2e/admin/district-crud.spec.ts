import { test, expect } from '@playwright/test';

/**
 * District CRUD Operations E2E Tests
 *
 * Tests the district management table on the System Admin Districts page.
 * Covers table rendering, search filtering, status filtering, sorting,
 * edit modal, and delete confirmation dialog.
 *
 * These tests use `test.describe.serial` because they depend on page state
 * established in earlier tests (e.g., verifying the table exists before
 * testing filters against it).
 *
 * Prerequisites:
 * 1. System admin test credentials configured in .env.test
 * 2. At least two seeded districts (Westside, Eastside) in the database
 *
 * To run: npx playwright test e2e/admin/district-crud.spec.ts
 */

const shouldSkipAuthTests = !process.env.TEST_SYSTEM_ADMIN_EMAIL;

/**
 * Helper function to login as system admin.
 * Requires TEST_SYSTEM_ADMIN_EMAIL and TEST_SYSTEM_ADMIN_PASSWORD environment variables.
 */
async function loginAsSystemAdmin(page: any) {
  const email = process.env.TEST_SYSTEM_ADMIN_EMAIL;
  const password = process.env.TEST_SYSTEM_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'System admin test credentials not configured. ' +
      'Set TEST_SYSTEM_ADMIN_EMAIL and TEST_SYSTEM_ADMIN_PASSWORD in .env.test'
    );
  }

  // Navigate to login page with admin subdomain
  await page.goto('/login?subdomain=admin');

  // Fill in credentials
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  // Submit form
  await page.locator('button[type="submit"]').click();

  // Wait for navigation to admin dashboard
  await page.waitForURL(/\?subdomain=admin/, { timeout: 10000 });
}

test.describe.serial('District CRUD Operations', () => {
  test.skip(shouldSkipAuthTests, 'requires test credentials');

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should navigate to districts page and verify table renders', async ({ page }) => {
    await loginAsSystemAdmin(page);

    // Navigate to districts page
    await page.goto('/districts?subdomain=admin');
    await page.waitForLoadState('networkidle');

    // Verify the Districts heading is visible
    await expect(page.getByRole('heading', { name: /Districts/i })).toBeVisible();

    // Verify the table renders with at least one row
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // Verify the "Add District" button exists
    await expect(page.getByRole('link', { name: /Add District/i })).toBeVisible();
  });

  test('should filter districts by search term', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/districts?subdomain=admin');
    await page.waitForLoadState('networkidle');

    // Type a search term
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('westside');

    // Wait for filtering to apply
    await page.waitForTimeout(300);

    // Should show Westside and not show other districts
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody').getByText('Westside')).toBeVisible();

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // Should show all districts again
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThanOrEqual(2); // At least Westside and Eastside
  });

  test('should filter districts by status', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/districts?subdomain=admin');
    await page.waitForLoadState('networkidle');

    // Get initial count
    const initialCount = await page.locator('tbody tr').count();

    // Click "Active" filter
    await page.locator('select').selectOption('active');
    await page.waitForTimeout(300);

    // All visible districts should have "Active" badge
    const rows = page.locator('tbody tr');
    const activeCount = await rows.count();
    for (let i = 0; i < activeCount; i++) {
      await expect(rows.nth(i).getByText('Active')).toBeVisible();
    }

    // Reset to All
    await page.locator('select').selectOption('all');
    await page.waitForTimeout(300);
    expect(await page.locator('tbody tr').count()).toBe(initialCount);
  });

  test('should sort districts by name', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/districts?subdomain=admin');
    await page.waitForLoadState('networkidle');

    // Click the "District" column header to sort
    await page.locator('thead th').first().click();
    await page.waitForTimeout(300);

    // Get first row name
    const firstNameAsc = await page.locator('tbody tr').first().locator('td').first().textContent();

    // Click again to reverse sort
    await page.locator('thead th').first().click();
    await page.waitForTimeout(300);

    const firstNameDesc = await page.locator('tbody tr').first().locator('td').first().textContent();

    // Names should be different (assuming more than 1 district)
    expect(firstNameAsc).not.toBe(firstNameDesc);
  });

  test('should open edit modal from actions menu', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/districts?subdomain=admin');
    await page.waitForLoadState('networkidle');

    // Click the first row's actions button (3-dot menu)
    await page.locator('tbody tr').first().locator('button[aria-label="Actions"]').click();

    // Click "Edit District" from dropdown
    await page.getByText('Edit District').click();

    // Verify edit modal opens
    await expect(page.getByText('Edit District').first()).toBeVisible();

    // Verify form is pre-filled
    const nameInput = page.locator('input').first();
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);

    // Close modal
    await page.locator('button').filter({ hasText: 'Cancel' }).click();

    // Modal should be closed
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
  });

  test('should open delete confirmation from actions menu', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await page.goto('/districts?subdomain=admin');
    await page.waitForLoadState('networkidle');

    // Click the first row's actions button
    await page.locator('tbody tr').first().locator('button[aria-label="Actions"]').click();

    // Click "Delete District"
    await page.getByText('Delete District').click();

    // Verify delete confirmation modal opens
    await expect(page.getByText('Delete District').first()).toBeVisible();
    await expect(page.getByText(/permanently delete/i)).toBeVisible();

    // The delete button should be disabled initially
    const deleteButton = page.locator('button').filter({ hasText: /^Delete District$/ });
    await expect(deleteButton).toBeDisabled();

    // Close modal by clicking Cancel
    await page.locator('button').filter({ hasText: 'Cancel' }).click();
  });
});
