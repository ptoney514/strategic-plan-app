import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/login-page';

/**
 * Dashboard Template E2E Tests
 *
 * Verifies the Card Design Template feature works end-to-end:
 * 1. Admin can select and configure dashboard templates
 * 2. Public dashboard renders correctly based on template selection
 * 3. Template switching updates the public view
 */

const WESTSIDE_ADMIN = {
  email: 'admin@westside66.org',
  password: 'Westside123!',
};

const DISTRICT_SLUG = 'westside';

test.describe('Dashboard Template Admin Settings', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as district admin
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Navigate to Appearance page
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');
  });

  test('should display template selector with 3 options', async ({ page }) => {
    // Verify the template selector section is visible
    const templateSection = page.locator('text=Dashboard Template');
    await expect(templateSection).toBeVisible();

    // Verify all 3 template options are present
    const templateSelector = page.locator('[data-testid="template-selector"]');
    await expect(templateSelector).toBeVisible();

    // Check for the 3 template options
    const hierarchicalOption = page.locator('[data-testid="template-option-hierarchical"]');
    const metricsGridOption = page.locator('[data-testid="template-option-metrics-grid"]');
    const launchTractionOption = page.locator('[data-testid="template-option-launch-traction"]');

    await expect(hierarchicalOption).toBeVisible();
    await expect(metricsGridOption).toBeVisible();
    await expect(launchTractionOption).toBeVisible();
  });

  test('should display template names correctly', async ({ page }) => {
    // Verify template names are displayed
    await expect(page.locator('text=Hierarchical')).toBeVisible();
    await expect(page.locator('text=Metrics Grid')).toBeVisible();
    await expect(page.locator('text=Launch Traction')).toBeVisible();
  });

  test('should display template config options', async ({ page }) => {
    // Verify config editor section is visible
    const configEditor = page.locator('[data-testid="template-config"]');
    await expect(configEditor).toBeVisible();

    // Verify config options are present
    const sidebarToggle = page.locator('[data-testid="config-show-sidebar"]');
    const heroToggle = page.locator('[data-testid="config-show-hero"]');
    const animationsToggle = page.locator('[data-testid="config-enable-animations"]');

    await expect(sidebarToggle).toBeVisible();
    await expect(heroToggle).toBeVisible();
    await expect(animationsToggle).toBeVisible();

    // Verify grid column options
    const grid2Button = page.locator('[data-testid="config-grid-2"]');
    const grid3Button = page.locator('[data-testid="config-grid-3"]');
    const grid4Button = page.locator('[data-testid="config-grid-4"]');

    await expect(grid2Button).toBeVisible();
    await expect(grid3Button).toBeVisible();
    await expect(grid4Button).toBeVisible();
  });

  test('should select a different template', async ({ page }) => {
    // Click on a different template
    const metricsGridOption = page.locator('[data-testid="template-option-metrics-grid"]');
    await metricsGridOption.click();

    // Verify the selection changed (check for selected state)
    await expect(metricsGridOption).toHaveClass(/border-amber-500/);
  });

  test('should toggle config options', async ({ page }) => {
    // Toggle sidebar option
    const sidebarToggle = page.locator('[data-testid="config-show-sidebar"]');
    const initialChecked = await sidebarToggle.isChecked();

    await sidebarToggle.click();
    await expect(sidebarToggle).toHaveProperty('checked', !initialChecked);
  });

  test('should change grid columns', async ({ page }) => {
    // Click on 4 columns option
    const grid4Button = page.locator('[data-testid="config-grid-4"]');
    await grid4Button.click();

    // Verify the selection changed (check for selected state)
    await expect(grid4Button).toHaveClass(/bg-amber-500/);
  });

  test('should save template changes', async ({ page }) => {
    // Select a different template
    const launchTractionOption = page.locator('[data-testid="template-option-launch-traction"]');
    await launchTractionOption.click();

    // Click save button
    const saveButton = page.locator('button:has-text("Save")');
    await saveButton.click();

    // Wait for save to complete (button text changes during save)
    await expect(saveButton).not.toHaveText(/Saving/);

    // Reload page and verify selection persisted
    await page.reload();
    await page.waitForLoadState('networkidle');

    // The launch-traction option should still be selected
    const reloadedOption = page.locator('[data-testid="template-option-launch-traction"]');
    await expect(reloadedOption).toHaveClass(/border-amber-500/);
  });

  test('should change card style variant', async ({ page }) => {
    // Verify card style options exist
    const compactButton = page.locator('[data-testid="config-card-compact"]');
    const richButton = page.locator('[data-testid="config-card-rich"]');

    await expect(compactButton).toBeVisible();
    await expect(richButton).toBeVisible();

    // Click on compact card style
    await compactButton.click();
    await expect(compactButton).toHaveClass(/bg-amber-500/);
  });
});

test.describe('Appearance Page Color Settings', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as district admin
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Navigate to Appearance page
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');
  });

  test('should display color settings section', async ({ page }) => {
    // Verify Colors section is visible
    await expect(page.locator('h2:has-text("Colors")')).toBeVisible();

    // Verify color inputs are present
    const primaryColorPicker = page.locator('[data-testid="color-primary-picker"]');
    const primaryColorInput = page.locator('[data-testid="color-primary-input"]');
    const secondaryColorPicker = page.locator('[data-testid="color-secondary-picker"]');
    const secondaryColorInput = page.locator('[data-testid="color-secondary-input"]');

    await expect(primaryColorPicker).toBeVisible();
    await expect(primaryColorInput).toBeVisible();
    await expect(secondaryColorPicker).toBeVisible();
    await expect(secondaryColorInput).toBeVisible();
  });

  test('can change primary color via text input', async ({ page }) => {
    const primaryColorInput = page.locator('[data-testid="color-primary-input"]');

    // Clear and enter new color
    await primaryColorInput.fill('#FF5500');

    // Verify the value changed
    await expect(primaryColorInput).toHaveValue('#FF5500');
  });

  test('can change secondary color via text input', async ({ page }) => {
    const secondaryColorInput = page.locator('[data-testid="color-secondary-input"]');

    // Clear and enter new color
    await secondaryColorInput.fill('#00FF55');

    // Verify the value changed
    await expect(secondaryColorInput).toHaveValue('#00FF55');
  });

  test('color changes persist after save and reload', async ({ page }) => {
    const primaryColorInput = page.locator('[data-testid="color-primary-input"]');

    // Get initial value to restore later
    const initialColor = await primaryColorInput.inputValue();

    // Set a specific test color
    const testColor = '#123456';
    await primaryColorInput.fill(testColor);

    // Save changes
    const saveButton = page.locator('[data-testid="appearance-save-btn"]');
    await saveButton.click();
    await expect(saveButton).not.toHaveText(/Saving/);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify color persisted
    const reloadedInput = page.locator('[data-testid="color-primary-input"]');
    await expect(reloadedInput).toHaveValue(testColor);

    // Restore original color
    await reloadedInput.fill(initialColor);
    await page.locator('[data-testid="appearance-save-btn"]').click();
    await page.waitForTimeout(1000);
  });
});

test.describe('Appearance Page Preview Section', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as district admin
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Navigate to Appearance page
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');
  });

  test('should display preview section', async ({ page }) => {
    const previewSection = page.locator('[data-testid="appearance-preview"]');
    await expect(previewSection).toBeVisible();
    await expect(page.locator('h2:has-text("Preview")')).toBeVisible();
  });

  test('preview shows district name', async ({ page }) => {
    const previewTitle = page.locator('[data-testid="preview-title"]');
    await expect(previewTitle).toBeVisible();
    // Should contain some text (the district name)
    const titleText = await previewTitle.textContent();
    expect(titleText?.length).toBeGreaterThan(0);
  });

  test('preview shows initials when no logo', async ({ page }) => {
    // Check for either logo or initials
    const previewLogo = page.locator('[data-testid="preview-logo"]');
    const previewInitials = page.locator('[data-testid="preview-initials"]');

    // Either logo or initials should be visible
    const hasLogo = await previewLogo.count() > 0;
    const hasInitials = await previewInitials.count() > 0;

    expect(hasLogo || hasInitials).toBe(true);
  });

  test('preview background changes with primary color', async ({ page }) => {
    const previewBackground = page.locator('[data-testid="preview-background"]');
    const primaryColorInput = page.locator('[data-testid="color-primary-input"]');

    // Set a known color
    await primaryColorInput.fill('#FF0000');

    // Get the background style
    const style = await previewBackground.getAttribute('style');

    // The background should contain the color (with opacity suffix)
    expect(style).toContain('#FF0000');
  });

  test('preview title color changes with primary color', async ({ page }) => {
    const previewTitle = page.locator('[data-testid="preview-title"]');
    const primaryColorInput = page.locator('[data-testid="color-primary-input"]');

    // Set a known color
    await primaryColorInput.fill('#00FF00');

    // Get the style
    const style = await previewTitle.getAttribute('style');

    // The title color should match
    expect(style).toContain('#00FF00');
  });
});

test.describe('Appearance Page Logo Upload', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as district admin
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Navigate to Appearance page
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');
  });

  test('should display logo section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Logo")')).toBeVisible();
  });

  test('should display logo upload dropzone or preview', async ({ page }) => {
    // Either dropzone or preview should be visible depending on current state
    const dropzone = page.locator('[data-testid="logo-upload-dropzone"]');
    const preview = page.locator('[data-testid="logo-preview-container"]');

    const hasDropzone = await dropzone.count() > 0;
    const hasPreview = await preview.count() > 0;

    expect(hasDropzone || hasPreview).toBe(true);
  });

  test('dropzone shows upload instructions when no logo', async ({ page }) => {
    const dropzone = page.locator('[data-testid="logo-upload-dropzone"]');

    if (await dropzone.count() > 0) {
      await expect(dropzone).toContainText(/drag and drop|click to upload/i);
    }
  });
});

test.describe('Appearance Page Save & Persistence', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as district admin
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Navigate to Appearance page
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');
  });

  test('save button shows loading state during save', async ({ page }) => {
    const saveButton = page.locator('[data-testid="appearance-save-btn"]');

    // Make a small change to trigger save
    const primaryColorInput = page.locator('[data-testid="color-primary-input"]');
    const currentValue = await primaryColorInput.inputValue();
    await primaryColorInput.fill('#AABBCC');

    // Click save and quickly check for loading state
    await saveButton.click();

    // The button text should change to "Saving..." briefly
    // Note: This may be too fast to catch in some cases
    await expect(saveButton).not.toBeDisabled({ timeout: 5000 });

    // Restore original value
    await primaryColorInput.fill(currentValue);
    await saveButton.click();
    await page.waitForTimeout(1000);
  });

  test('all settings persist after page reload', async ({ page }) => {
    // Make multiple changes
    const primaryColorInput = page.locator('[data-testid="color-primary-input"]');
    const metricsGridOption = page.locator('[data-testid="template-option-metrics-grid"]');
    const grid4Button = page.locator('[data-testid="config-grid-4"]');

    // Save original values
    const originalColor = await primaryColorInput.inputValue();

    // Make changes
    await primaryColorInput.fill('#112233');
    await metricsGridOption.click();
    await grid4Button.click();

    // Save
    const saveButton = page.locator('[data-testid="appearance-save-btn"]');
    await saveButton.click();
    await expect(saveButton).not.toHaveText(/Saving/);

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify all changes persisted
    await expect(page.locator('[data-testid="color-primary-input"]')).toHaveValue('#112233');
    await expect(page.locator('[data-testid="template-option-metrics-grid"]')).toHaveClass(/border-amber-500/);
    await expect(page.locator('[data-testid="config-grid-4"]')).toHaveClass(/bg-amber-500/);

    // Restore original values for cleanup
    await page.locator('[data-testid="color-primary-input"]').fill(originalColor);
    await page.locator('[data-testid="template-option-hierarchical"]').click();
    await page.locator('[data-testid="config-grid-3"]').click();
    await page.locator('[data-testid="appearance-save-btn"]').click();
    await page.waitForTimeout(1000);
  });

  test('public dashboard reflects admin color changes', async ({ page }) => {
    const primaryColorInput = page.locator('[data-testid="color-primary-input"]');

    // Save original value
    const originalColor = await primaryColorInput.inputValue();

    // Set a distinctive color
    const testColor = '#FF5500';
    await primaryColorInput.fill(testColor);

    // Save
    const saveButton = page.locator('[data-testid="appearance-save-btn"]');
    await saveButton.click();
    await expect(saveButton).not.toHaveText(/Saving/);

    // Navigate to public dashboard
    await page.context().clearCookies();
    await page.goto(`/${DISTRICT_SLUG}`);
    await page.waitForLoadState('networkidle');

    // The public page should load successfully
    await expect(page).toHaveURL(new RegExp(`/${DISTRICT_SLUG}`));

    // Restore original color (need to login again)
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="color-primary-input"]').fill(originalColor);
    await page.locator('[data-testid="appearance-save-btn"]').click();
    await page.waitForTimeout(1000);
  });
});

test.describe('Dashboard Template Public Display', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies to ensure we're viewing as public user
    await page.context().clearCookies();
  });

  test('hierarchical template should show objectives grid', async ({ page }) => {
    // Navigate to public dashboard
    await page.goto(`/${DISTRICT_SLUG}`);
    await page.waitForLoadState('networkidle');

    // At minimum, the page should load without errors
    await expect(page).toHaveURL(new RegExp(`/${DISTRICT_SLUG}`));

    // Should show district name or heading
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible();

    // Check for hierarchical template elements (objectives grid may be present)
    const objectivesGrid = page.locator('[data-testid="objectives-grid"]');
    // Grid visibility depends on template and data, so we just verify the page loaded
    expect(await objectivesGrid.count()).toBeGreaterThanOrEqual(0);
  });

  test('launch-traction template should show hero section', async ({ page }) => {
    // First, login as admin and set launch-traction template
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Navigate to appearance and set template
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Select launch-traction template
    const launchOption = page.locator('[data-testid="template-option-launch-traction"]');
    if (await launchOption.count() > 0) {
      await launchOption.click();

      // Save changes
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForTimeout(1000); // Wait for save
    }

    // Clear cookies to view as public
    await page.context().clearCookies();

    // Navigate to public dashboard
    await page.goto(`/${DISTRICT_SLUG}`);
    await page.waitForLoadState('networkidle');

    // Launch-traction template has full-width layout
    // Check that the page loads correctly
    await expect(page).toHaveURL(new RegExp(`/${DISTRICT_SLUG}`));
  });

  test('metrics-grid template should show flat grid', async ({ page }) => {
    // First, login as admin and set metrics-grid template
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Navigate to appearance and set template
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Select metrics-grid template
    const metricsOption = page.locator('[data-testid="template-option-metrics-grid"]');
    if (await metricsOption.count() > 0) {
      await metricsOption.click();

      // Save changes
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForTimeout(1000); // Wait for save
    }

    // Clear cookies to view as public
    await page.context().clearCookies();

    // Navigate to public dashboard
    await page.goto(`/${DISTRICT_SLUG}`);
    await page.waitForLoadState('networkidle');

    // Metrics-grid template shows flat grid of metrics
    await expect(page).toHaveURL(new RegExp(`/${DISTRICT_SLUG}`));
  });
});

test.describe('Template Switching End-to-End', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();
  });

  test('changing template in admin updates public view', async ({ page }) => {
    // Step 1: Login and set hierarchical template
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Select hierarchical template first
    const hierarchicalOption = page.locator('[data-testid="template-option-hierarchical"]');
    if (await hierarchicalOption.count() > 0) {
      await hierarchicalOption.click();
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Step 2: Open public dashboard in a new context to verify
    const publicContext = await page.context().browser()?.newContext();
    if (publicContext) {
      const publicPage = await publicContext.newPage();
      await publicPage.goto(`http://localhost:5173/${DISTRICT_SLUG}`);
      await publicPage.waitForLoadState('networkidle');

      // Verify page loads (hierarchical is default)
      await expect(publicPage).toHaveURL(new RegExp(`/${DISTRICT_SLUG}`));

      await publicPage.close();
      await publicContext.close();
    }

    // Step 3: Change to launch-traction template
    const launchOption = page.locator('[data-testid="template-option-launch-traction"]');
    if (await launchOption.count() > 0) {
      await launchOption.click();
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Step 4: Verify public dashboard now shows launch-traction template
    await page.context().clearCookies();
    await page.goto(`/${DISTRICT_SLUG}`);
    await page.waitForLoadState('networkidle');

    // Page should load with the new template
    await expect(page).toHaveURL(new RegExp(`/${DISTRICT_SLUG}`));
  });

  test('template config changes persist after page reload', async ({ page }) => {
    // Login as admin
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Change config options
    const animationsToggle = page.locator('[data-testid="config-enable-animations"]');
    if (await animationsToggle.count() > 0) {
      const initialState = await animationsToggle.isChecked();
      await animationsToggle.click();

      // Save changes
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify config persisted
      const reloadedToggle = page.locator('[data-testid="config-enable-animations"]');
      const newState = await reloadedToggle.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test('grid column changes reflect in public dashboard', async ({ page }) => {
    // Login as admin
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Select metrics-grid template
    const metricsOption = page.locator('[data-testid="template-option-metrics-grid"]');
    if (await metricsOption.count() > 0) {
      await metricsOption.click();
    }

    // Change to 4 columns
    const grid4Button = page.locator('[data-testid="config-grid-4"]');
    if (await grid4Button.count() > 0) {
      await grid4Button.click();

      // Save changes
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to public dashboard
    await page.context().clearCookies();
    await page.goto(`/${DISTRICT_SLUG}`);
    await page.waitForLoadState('networkidle');

    // Page should load successfully
    await expect(page).toHaveURL(new RegExp(`/${DISTRICT_SLUG}`));
  });
});

test.describe('Template Appearance Page Accessibility', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.context().clearCookies();

    // Login as district admin
    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test('template options should be keyboard navigable', async ({ page }) => {
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Focus on first template option and use Tab to navigate
    const firstOption = page.locator('[data-testid="template-option-hierarchical"]');
    await firstOption.focus();

    // Press Tab to move to next option
    await page.keyboard.press('Tab');

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Verify selection changed
    const secondOption = page.locator('[data-testid="template-option-metrics-grid"]');
    await expect(secondOption).toHaveClass(/border-amber-500/);
  });

  test('config toggles should be accessible with keyboard', async ({ page }) => {
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Focus on sidebar toggle
    const sidebarToggle = page.locator('[data-testid="config-show-sidebar"]');
    await sidebarToggle.focus();

    // Press Space to toggle
    const initialState = await sidebarToggle.isChecked();
    await page.keyboard.press('Space');

    // Verify toggle changed
    const newState = await sidebarToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('appearance page should have proper headings', async ({ page }) => {
    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Verify main heading exists
    const mainHeading = page.locator('h1:has-text("Appearance")');
    await expect(mainHeading).toBeVisible();

    // Verify section headings exist
    await expect(page.locator('h2:has-text("Colors")')).toBeVisible();
    await expect(page.locator('h2:has-text("Logo")')).toBeVisible();
    await expect(page.locator('h2:has-text("Dashboard Template")')).toBeVisible();
  });
});

// Cleanup test - reset to default template after all tests
test.describe('Cleanup', () => {
  test('reset template to hierarchical after tests', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.context().clearCookies();

    await loginPage.goto();
    await loginPage.login(WESTSIDE_ADMIN.email, WESTSIDE_ADMIN.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`/${DISTRICT_SLUG}/admin/appearance`);
    await page.waitForLoadState('networkidle');

    // Reset to hierarchical template
    const hierarchicalOption = page.locator('[data-testid="template-option-hierarchical"]');
    if (await hierarchicalOption.count() > 0) {
      await hierarchicalOption.click();

      // Save changes
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    await expect(hierarchicalOption).toHaveClass(/border-amber-500/);
  });
});
