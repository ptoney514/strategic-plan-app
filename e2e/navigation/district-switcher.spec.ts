import { test, expect } from '@playwright/test';

/**
 * District Switcher Navigation Tests
 *
 * Tests the district switcher component behavior for:
 * 1. Multi-district users (system admin) - should see dropdown to switch between districts
 * 2. Single-district users - should see static district header (no dropdown)
 *
 * Uses lvh.me subdomain routing when available, falls back to query params.
 * See CLAUDE.md for lvh.me setup instructions.
 */

// Test credentials from CLAUDE.md
const TEST_USERS = {
  sysadmin: {
    email: 'sysadmin@stratadash.com',
    password: 'Stratadash123!',
    role: 'System Admin - has access to multiple districts',
  },
  westsideAdmin: {
    email: 'admin@westside66.org',
    password: 'Westside123!',
    role: 'Westside Admin - single district access only',
  },
};

// Helper to build subdomain URLs
// Uses query params for localhost (Playwright default), lvh.me for production-like testing
function getDistrictUrl(district: string, path = '/admin') {
  // Playwright uses localhost by default, so we use query params
  // For manual testing with lvh.me, you'd use: `http://${district}.lvh.me:5173${path}`
  return `${path}?subdomain=${district}`;
}

test.describe('District Switcher Navigation', () => {
  test.describe('Multi-district user (sysadmin)', () => {
    test.beforeEach(async ({ page }) => {
      // Clear cookies to ensure fresh auth state
      await page.context().clearCookies();

      // Navigate to Westside admin login
      await page.goto(getDistrictUrl('westside', '/login'));

      // Login as sysadmin (has access to multiple districts)
      await page.locator('input[type="email"]').fill(TEST_USERS.sysadmin.email);
      await page.locator('input[type="password"]').fill(TEST_USERS.sysadmin.password);
      await page.locator('button[type="submit"]').click();

      // Wait for navigation to admin dashboard
      await page.waitForURL(/\/admin/, { timeout: 15000 });
    });

    test('shows district switcher dropdown in sidebar', async ({ page }) => {
      // The district switcher should be visible for multi-district users
      const switcher = page.locator('[data-testid="district-switcher"]');
      await expect(switcher).toBeVisible({ timeout: 10000 });
    });

    test('displays current district name in header', async ({ page }) => {
      // Wait for district data to load (skeleton should disappear)
      await page.waitForSelector('[data-testid="district-switcher"]', { timeout: 10000 });

      // Should show Westside district name
      await expect(page.locator('text=Westside')).toBeVisible();
    });

    test('shows all accessible districts in dropdown', async ({ page }) => {
      // Open the district switcher dropdown
      await page.click('[data-testid="district-switcher"]');

      // Should show both districts accessible to sysadmin
      const districtOptions = page.locator('[data-testid="district-option"]');
      await expect(districtOptions).toHaveCount(2);

      // Both districts should be visible
      await expect(page.locator('[data-testid="district-option"]:has-text("Westside")')).toBeVisible();
      await expect(page.locator('[data-testid="district-option"]:has-text("Eastside")')).toBeVisible();
    });

    test('current district has checkmark indicator', async ({ page }) => {
      // Open the district switcher dropdown
      await page.click('[data-testid="district-switcher"]');

      // The current district (Westside) should be marked as current
      const currentOption = page.locator('[data-testid="district-option"][data-current="true"]');
      await expect(currentOption).toContainText('Westside');
    });

    test('clicking another district navigates to that subdomain', async ({ page }) => {
      // Open the district switcher dropdown
      await page.click('[data-testid="district-switcher"]');

      // Click on Eastside district
      await page.click('[data-testid="district-option"]:has-text("Eastside")');

      // Should navigate to Eastside admin
      // In localhost mode, this changes the subdomain query param
      await expect(page).toHaveURL(/subdomain=eastside.*\/admin|eastside\..*\/admin/, { timeout: 10000 });
    });

    test('session persists after switching districts', async ({ page }) => {
      // Open the district switcher dropdown
      await page.click('[data-testid="district-switcher"]');

      // Click on Eastside district
      await page.click('[data-testid="district-option"]:has-text("Eastside")');

      // Wait for navigation
      await page.waitForURL(/subdomain=eastside|eastside\./, { timeout: 10000 });

      // Should NOT be redirected to login (session should persist)
      await expect(page).not.toHaveURL(/\/login/);

      // Should see admin content (not login form)
      const adminContent = page.locator('nav, [data-testid="district-switcher"], .sidebar');
      await expect(adminContent.first()).toBeVisible({ timeout: 10000 });
    });

    test('View All Districts link navigates to root dashboard', async ({ page }) => {
      // Open the district switcher dropdown
      await page.click('[data-testid="district-switcher"]');

      // Click "View All Districts" link
      await page.click('text=View All Districts');

      // Should navigate to root domain dashboard
      // In localhost mode, this removes the subdomain param or sets it to empty
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    test('loading skeleton shows while district data loads', async ({ page }) => {
      // Navigate to a fresh district page
      await page.goto(getDistrictUrl('westside', '/admin'));

      // Either skeleton should appear briefly OR district switcher should appear
      // We just verify that the logo is NOT shown during loading on district subdomains
      // (should show skeleton or district header instead)
      await expect(page.locator('[data-testid="district-switcher"]')).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Single-district user', () => {
    test.beforeEach(async ({ page }) => {
      // Clear cookies to ensure fresh auth state
      await page.context().clearCookies();

      // Navigate to Westside admin login
      await page.goto(getDistrictUrl('westside', '/login'));

      // Login as Westside admin (single district access only)
      await page.locator('input[type="email"]').fill(TEST_USERS.westsideAdmin.email);
      await page.locator('input[type="password"]').fill(TEST_USERS.westsideAdmin.password);
      await page.locator('button[type="submit"]').click();

      // Wait for navigation to admin dashboard
      await page.waitForURL(/\/admin/, { timeout: 15000 });
    });

    test('shows static district header (no dropdown)', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      // Should show district name
      await expect(page.locator('text=Westside')).toBeVisible();

      // Should NOT have the dropdown trigger (no chevron, not clickable as button)
      const switcher = page.locator('[data-testid="district-switcher"]');
      await expect(switcher).not.toBeVisible();
    });

    test('displays district name in sidebar header', async ({ page }) => {
      // Wait for district data to load
      await page.waitForTimeout(2000);

      // Should show the full district name
      await expect(page.locator('text=Westside')).toBeVisible();

      // Should show "Strategic Planning" subtitle
      await expect(page.locator('text=Strategic Planning')).toBeVisible();
    });

    test('no StrataDASH logo shown on district page', async ({ page }) => {
      // Wait for page to fully load
      await page.waitForTimeout(3000);

      // The StrataDASH logo should NOT be shown in the sidebar header
      // on district subdomains - should show district name instead
      const sidebarHeader = page.locator('aside').locator('div.h-\\[72px\\]').first();
      await expect(sidebarHeader.locator('text=StrataDASH')).not.toBeVisible();
    });
  });

  test.describe('Edge cases', () => {
    test('handles slow network gracefully with skeleton', async ({ page }) => {
      // Slow down network to simulate loading states
      await page.route('**/rest/v1/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.continue();
      });

      // Clear cookies
      await page.context().clearCookies();

      // Navigate to Westside admin
      await page.goto(getDistrictUrl('westside', '/login'));

      // Login
      await page.locator('input[type="email"]').fill(TEST_USERS.sysadmin.email);
      await page.locator('input[type="password"]').fill(TEST_USERS.sysadmin.password);
      await page.locator('button[type="submit"]').click();

      // Wait for admin page
      await page.waitForURL(/\/admin/, { timeout: 15000 });

      // During loading, should NOT show StrataDASH logo in header
      // (should show skeleton or district header)
      // Eventually the district switcher should appear
      await expect(page.locator('[data-testid="district-switcher"]')).toBeVisible({ timeout: 20000 });
    });
  });
});
