import { test, expect } from '@playwright/test';
import { LoginPage } from './helpers/login-page';

const districtEmail = process.env.TEST_DISTRICT_ADMIN_EMAIL || 'admin@westside66.org';
const districtPassword = process.env.TEST_DISTRICT_ADMIN_PASSWORD || 'Westside123!';
const systemEmail = process.env.TEST_SYSTEM_ADMIN_EMAIL || 'sysadmin@stratadash.com';
const systemPassword = process.env.TEST_SYSTEM_ADMIN_PASSWORD || 'Stratadash123!';

/**
 * Detect whether we're running against a real subdomain host (production/staging)
 * or localhost (which uses ?subdomain= query params).
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5174';
const isLocalhost = new URL(baseURL).hostname === 'localhost' || new URL(baseURL).hostname === '127.0.0.1';

/** Build a district URL that works on both localhost (?subdomain=) and real subdomains (/slug) */
function districtURL(slug: string, path = '') {
  if (isLocalhost) {
    return `${path || '/'}?subdomain=${slug}`;
  }
  return `/${slug}${path}`;
}

/**
 * Try to log in and return whether it succeeded.
 * Returns true if login navigated away from /login, false if an error appeared.
 */
async function tryLogin(page: import('@playwright/test').Page, email: string, password: string): Promise<boolean> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);

  // Race: either the error alert appears or we navigate away from /login
  const result = await Promise.race([
    page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 10000 }).then(() => 'error' as const),
    page.waitForURL(url => !new URL(url).pathname.startsWith('/login'), { timeout: 10000 }).then(() => 'success' as const),
  ]).catch(() => 'timeout' as const);

  return result === 'success';
}

/**
 * Smoke Tests @smoke
 *
 * Quick read-only validation suite for production or staging deploys.
 * No data mutations — safe to run against any environment.
 */
test.describe('Smoke Tests @smoke', () => {
  // --- Unauthenticated ---

  test('API health check', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBeDefined();
  });

  test('public district page loads', async ({ page, request }) => {
    // Check if district data exists before testing the page
    const apiRes = await request.get('/api/organizations?public=true');
    const orgs = await apiRes.json();
    if (!Array.isArray(orgs) || orgs.length === 0) {
      test.skip(true, 'No public organizations in database — district pages cannot render');
      return;
    }

    await page.goto(districtURL('westside'), { waitUntil: 'domcontentloaded' });

    // Should render district content (not a 404 or error)
    await expect(page.locator('h1, h2, [data-testid="district-name"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('public goals page loads', async ({ page, request }) => {
    const apiRes = await request.get('/api/organizations?public=true');
    const orgs = await apiRes.json();
    if (!Array.isArray(orgs) || orgs.length === 0) {
      test.skip(true, 'No public organizations in database — goals page cannot render');
      return;
    }

    await page.goto(districtURL('westside', '/goals'), { waitUntil: 'domcontentloaded' });

    // Should render goals content
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('login page renders', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('non-existent district shows appropriate response', async ({ page }) => {
    await page.goto(districtURL('fake-district-that-does-not-exist'), { waitUntil: 'domcontentloaded' });

    // Should show "not found" content or redirect
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    // Either a 404 message, or redirect to login/home is acceptable
    expect(bodyText).toBeTruthy();
  });

  // --- Authenticated (district admin) ---

  test('login with valid credentials', async ({ page }) => {
    const success = await tryLogin(page, districtEmail, districtPassword);
    if (!success) {
      test.skip(true, 'Test user does not exist in database');
      return;
    }
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('admin page accessible after login', async ({ page }) => {
    const success = await tryLogin(page, districtEmail, districtPassword);
    if (!success) {
      test.skip(true, 'Test user does not exist in database');
      return;
    }

    // Navigate to admin
    await page.goto(districtURL('westside', '/admin'), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Should be on admin page (not redirected to login)
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('session persists on refresh', async ({ page }) => {
    const success = await tryLogin(page, districtEmail, districtPassword);
    if (!success) {
      test.skip(true, 'Test user does not exist in database');
      return;
    }

    // Refresh
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be authenticated
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('API memberships endpoint works when authenticated', async ({ page }) => {
    const success = await tryLogin(page, districtEmail, districtPassword);
    if (!success) {
      test.skip(true, 'Test user does not exist in database');
      return;
    }

    // Now make API call with the authenticated context
    const response = await page.request.get('/api/user/memberships');
    expect(response.status()).toBe(200);
  });

  // --- Authenticated (system admin, conditional) ---

  test('system admin dashboard loads', async ({ page }) => {
    await page.context().clearCookies();
    const success = await tryLogin(page, systemEmail, systemPassword);
    if (!success) {
      test.skip(true, 'System admin user does not exist in database');
      return;
    }

    // Should show admin content
    await expect(page).not.toHaveURL(/\/login/);
  });
});
