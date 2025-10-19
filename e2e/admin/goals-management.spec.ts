import { test, expect } from '@playwright/test';

/**
 * Admin Goals Management Tests
 *
 * Tests CRUD operations for goals in the admin interface.
 * All tests are skipped by default and require authentication setup.
 *
 * To enable these tests:
 * 1. Create test user credentials
 * 2. Update the auth fixture to handle login
 * 3. Remove test.skip and use test.describe() instead
 */

test.describe.skip('Admin Goals Management', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Authenticate before each test
    // This will be implemented with the auth fixture
    await page.goto('/westside/admin/goals');
  });

  test('should display admin goals page', async ({ page }) => {
    await expect(page).toHaveURL(/\/westside\/admin\/goals/);

    // Verify admin UI elements are visible
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Goal"), a[href*="/new"]');
    await expect(createButton.first()).toBeVisible();
  });

  test('should create a new Level 0 goal', async ({ page }) => {
    // Click create button
    const createButton = page.locator('button:has-text("Create"), a[href*="/objectives/new"]').first();
    await createButton.click();

    // Wait for objective builder page
    await expect(page).toHaveURL(/\/objectives\/new/);

    // Fill in goal form (adjust selectors based on actual form)
    await page.locator('input[name="title"], input[placeholder*="title"]').fill('Test Goal 1');
    await page.locator('textarea[name="description"]').fill('This is a test goal created by E2E tests');

    // Select level 0 if needed
    const levelSelect = page.locator('select[name="level"], [data-testid="level-select"]');
    if (await levelSelect.isVisible()) {
      await levelSelect.selectOption('0');
    }

    // Submit form
    await page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').click();

    // Verify redirect to goals list
    await expect(page).toHaveURL(/\/admin\/goals/);

    // Verify goal appears in list
    await expect(page.locator('text=Test Goal 1')).toBeVisible();
  });

  test('should create a Level 1 strategy under a goal', async ({ page }) => {
    // TODO: This requires selecting a parent goal
    // Implementation depends on UI structure
    test.skip();
  });

  test('should edit an existing goal', async ({ page }) => {
    // Find and click edit button for a goal
    const editButton = page.locator('button:has-text("Edit"), a[href*="/edit"]').first();
    await editButton.click();

    // Wait for objective builder in edit mode
    await expect(page).toHaveURL(/\/objectives\/.*\/edit/);

    // Update the title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title"]');
    await titleInput.clear();
    await titleInput.fill('Updated Goal Title');

    // Save changes
    await page.locator('button[type="submit"], button:has-text("Save")').click();

    // Verify redirect back to goals list
    await expect(page).toHaveURL(/\/admin\/goals/);

    // Verify updated title appears
    await expect(page.locator('text=Updated Goal Title')).toBeVisible();
  });

  test('should delete a goal', async ({ page }) => {
    // Find delete button
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await deleteButton.click();

    // Confirm deletion in dialog/modal
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
    await confirmButton.click();

    // Verify goal is removed from list
    // This would need to check that a specific goal is no longer visible
  });

  test('should add a metric to a goal', async ({ page }) => {
    // Navigate to goal with metrics
    // Click "Add Metric" button
    // Fill metric form
    // Verify metric appears
    test.skip(); // TODO: Implement based on UI
  });

  test('should validate required fields', async ({ page }) => {
    // Click create button
    const createButton = page.locator('button:has-text("Create"), a[href*="/objectives/new"]').first();
    await createButton.click();

    // Try to submit without filling required fields
    await page.locator('button[type="submit"]').click();

    // Verify validation errors appear
    const errorMessages = page.locator('[role="alert"], .error-message, [data-testid="error"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should display goal hierarchy correctly', async ({ page }) => {
    // Verify level 0 goals are displayed
    // Verify level 1 strategies are nested under goals
    // Verify level 2 sub-goals are nested under strategies
    test.skip(); // TODO: Implement based on UI structure
  });
});
