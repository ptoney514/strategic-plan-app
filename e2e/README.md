# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the Strategic Plan Builder application using Playwright.

## Structure

```
e2e/
├── fixtures/          # Test fixtures (auth, data setup)
├── helpers/           # Page Object Models and utilities
├── public/            # Tests for public-facing pages
├── auth/              # Authentication flow tests
├── admin/             # Admin interface tests
└── README.md          # This file
```

## Running Tests

### Prerequisites

- Local dev server must be running (or will be started automatically)
- Supabase local instance should be running for full functionality

### Available Commands

```bash
# Run all tests (headless mode)
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step-by-step
npm run test:e2e:debug

# View test report after running tests
npm run test:e2e:report
```

### Run Specific Test Suites

```bash
# Run only public access tests
npx playwright test e2e/public

# Run only authentication tests
npx playwright test e2e/auth

# Run only admin tests (requires auth setup)
npx playwright test e2e/admin
```

## Current Test Coverage

### ✅ Public Access Tests

- [x] District landing page loads without authentication
- [x] Goals page loads without authentication
- [x] Navigation between public pages
- [x] Non-existent district handling
- [x] Admin UI elements hidden on public pages

### ✅ Authentication Tests

- [x] Login form displays correctly
- [x] Form validation works
- [x] Invalid credentials show error
- [x] Admin pages redirect to login when not authenticated
- [ ] Successful login (requires test credentials)
- [ ] Session persistence after refresh
- [ ] Logout functionality

### ⏸️ System Admin Tests (Requires System Admin Credentials)

- [x] Dashboard counts - Stats cards aggregation
- [x] Dashboard counts - Card view with counts
- [x] Dashboard counts - Grid view with counts (default)
- [x] Dashboard counts - View mode switching (Card/Grid only)
- [x] Dashboard counts - Zero count handling
- [x] Dashboard counts - Cross-validation of totals
- [x] Dashboard counts - Status indicators display
- [ ] Create new district
- [ ] Edit district settings
- [ ] Delete district
- [ ] Manage system admins

### ⏸️ District Admin Tests (Requires Authentication Setup)

- [ ] Admin goals page displays
- [ ] Create Level 0 goal
- [ ] Create Level 1 strategy
- [ ] Create Level 2 sub-goal
- [ ] Edit existing goal
- [ ] Delete goal
- [ ] Add metrics to goals
- [ ] Form validation
- [ ] Goal hierarchy display

## Setup Required for Full Test Coverage

### 1. Create Test User Credentials

#### System Admin User (for system-admin-dashboard-counts.spec.ts)

1. Create a test user in your Supabase instance:

   ```sql
   -- Sign up through the UI first, or use SQL
   -- Then update user metadata to grant system admin access
   ```

2. Update user metadata to grant system admin role:
   - Go to Supabase Dashboard → Authentication → Users
   - Click on test user → Edit User
   - Update `user_metadata` JSON:

   ```json
   {
     "system_admin": true
   }
   ```

3. Create `.env.test` file with system admin credentials:
   ```env
   # System Admin Test User
   TEST_SYSTEM_ADMIN_EMAIL=sysadmin@test.com
   TEST_SYSTEM_ADMIN_PASSWORD=SecureTestPassword123!
   ```

#### District Admin User (for district admin tests)

1. Create a test user in your local Supabase instance:

   ```sql
   -- Create test user (run in Supabase SQL Editor)
   -- Note: You'll need to sign up through the UI first, then get the user_id

   -- Grant district admin access
   INSERT INTO public.spb_district_admins (user_id, district_id, district_slug)
   SELECT
     'YOUR_TEST_USER_ID_HERE'::uuid,
     id,
     slug
   FROM public.spb_districts
   WHERE slug = 'westside'
   ON CONFLICT (user_id, district_id) DO NOTHING;
   ```

2. Add district admin credentials to `.env.test`:

   ```env
   # District Admin Test User
   TEST_DISTRICT_ADMIN_EMAIL=districtadmin@test.com
   TEST_DISTRICT_ADMIN_PASSWORD=SecureTestPassword123!
   ```

3. Update the auth fixture in `e2e/fixtures/auth.ts` to use these credentials

### 2. Update Selectors

Some tests contain TODO comments for selectors that need to be updated based on actual UI structure. Search for:

```
// TODO: Update this selector
// TODO: Update selector based on actual
```

### 3. Seed Test Data

For the System Admin Dashboard Counts test to pass, ensure your test database has sample data:

```sql
-- Create test districts
INSERT INTO spb_districts (name, slug, admin_email, primary_color, is_public)
VALUES
  ('Test District 1', 'test-district-1', 'admin1@test.com', '#000000', true),
  ('Test District 2', 'test-district-2', 'admin2@test.com', '#0000FF', true);

-- Add goals to districts
INSERT INTO spb_goals (district_id, goal_number, title, level, order_position)
SELECT d.id, '1', 'Goal 1', 0, 1
FROM spb_districts d
WHERE d.slug IN ('test-district-1', 'test-district-2');

-- Add metrics to goals
INSERT INTO spb_metrics (goal_id, district_id, metric_name, unit, frequency, aggregation_method)
SELECT g.id, g.district_id, 'Test Metric', '%', 'monthly', 'average'
FROM spb_goals g
WHERE g.goal_number = '1';

-- Add district admins
INSERT INTO spb_district_admins (user_id, district_id, district_slug, school_slug)
SELECT 'user-id-here', id, slug, NULL
FROM spb_districts
WHERE slug IN ('test-district-1', 'test-district-2');
```

### 4. Enable Skipped Tests

Tests marked with `test.skip()` need additional setup. Once authentication is configured:

1. Remove `test.skip()` wrapper
2. Uncomment test implementation
3. Run tests to verify

## System Admin Dashboard Counts Test

**File:** `e2e/admin/system-admin-dashboard-counts.spec.ts`

This test suite validates the critical bug fix for district count aggregation on the System Admin Dashboard.

### What It Tests

1. **Stats Card Aggregation** - Total counts across all districts (Goals, Metrics, Admins)
2. **Card View** - Counts displayed in card layout with status indicators
3. **Grid View** - Condensed counts in 3-column grid format (default view)
4. **View Mode Switching** - Data persistence when switching between Card and Grid views
5. **Zero Count Handling** - Edge case when districts have no data
6. **Cross-Validation** - Verifies stats totals = sum of individual counts
7. **Status Indicators** - Public/private badges display correctly

### Running the Test

```bash
# All dashboard count tests
npx playwright test e2e/admin/system-admin-dashboard-counts.spec.ts

# Specific test
npx playwright test e2e/admin/system-admin-dashboard-counts.spec.ts -g "stats cards"

# With browser visible
npx playwright test e2e/admin/system-admin-dashboard-counts.spec.ts --headed

# Interactive mode
npx playwright test e2e/admin/system-admin-dashboard-counts.spec.ts --ui

# Debug mode
npx playwright test e2e/admin/system-admin-dashboard-counts.spec.ts --debug
```

### Prerequisites

- ✅ System admin test user created with `system_admin: true` in user_metadata
- ✅ `.env.test` configured with TEST_SYSTEM_ADMIN_EMAIL and PASSWORD
- ✅ At least one district with goals, metrics, and admins in database
- ✅ Dev server running (started automatically by Playwright)

### Expected Results

All authenticated tests should pass if:

- Stats cards show correct aggregated totals
- Card view displays counts with public/private status badges
- Grid view displays condensed counts (default view mode)
- Status badges show "Public" (green) or "Private" (gray) correctly
- Stats card totals match sum of individual district counts
- View modes switch between Card and Grid without data loss

**Note:** Tests are skipped by default if `TEST_SYSTEM_ADMIN_EMAIL` is not set in `.env.test`.

## Writing New Tests

### Best Practices

1. **Use Page Object Models**: Create helper classes in `e2e/helpers/` for reusable page interactions
2. **Descriptive test names**: Use clear, action-oriented names
3. **Isolate tests**: Each test should be independent
4. **Use data-testid**: Add `data-testid` attributes to components for stable selectors
5. **Wait for conditions**: Use Playwright's auto-waiting; avoid arbitrary timeouts

### Example Test

```typescript
import { test, expect } from "@playwright/test";

test("should do something important", async ({ page }) => {
  // Arrange
  await page.goto("/westside/goals");

  // Act
  await page.locator('[data-testid="goal-card"]').first().click();

  // Assert
  await expect(page).toHaveURL(/\/goals\/[a-z0-9-]+/);
  await expect(page.locator("h1")).toBeVisible();
});
```

## Debugging Tests

### VS Code Integration

Install the Playwright VS Code extension for:

- Run tests from the editor
- Set breakpoints
- Time travel debugging

### Common Issues

**Port conflicts**: Ensure local dev server isn't already running when you start tests (Playwright will start its own)

**Flaky tests**: If tests fail intermittently, add explicit waits:

```typescript
await page.waitForLoadState("networkidle");
await expect(element).toBeVisible();
```

**Authentication issues**: Check that cookies aren't being cleared unexpectedly

## CI/CD Integration

Tests are configured to run in CI/CD pipelines. The configuration in `playwright.config.ts` handles:

- Automatic server startup
- Browser installation
- Test artifacts (screenshots, traces)
- GitHub Actions reporter

Add to your GitHub Actions workflow:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
