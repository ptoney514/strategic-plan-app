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

### ⏸️ Admin Tests (Requires Authentication Setup)
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

To run authenticated tests, you'll need to:

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

2. Create a `.env.test` file with test credentials:
   ```env
   TEST_USER_EMAIL=test@westside66.org
   TEST_USER_PASSWORD=test_password_123
   ```

3. Update the auth fixture in `e2e/fixtures/auth.ts` to use these credentials

### 2. Update Selectors

Some tests contain TODO comments for selectors that need to be updated based on actual UI structure. Search for:

```
// TODO: Update this selector
// TODO: Update selector based on actual
```

### 3. Enable Skipped Tests

Tests marked with `test.skip()` need additional setup. Once authentication is configured:

1. Remove `test.skip()` wrapper
2. Uncomment test implementation
3. Run tests to verify

## Writing New Tests

### Best Practices

1. **Use Page Object Models**: Create helper classes in `e2e/helpers/` for reusable page interactions
2. **Descriptive test names**: Use clear, action-oriented names
3. **Isolate tests**: Each test should be independent
4. **Use data-testid**: Add `data-testid` attributes to components for stable selectors
5. **Wait for conditions**: Use Playwright's auto-waiting; avoid arbitrary timeouts

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test('should do something important', async ({ page }) => {
  // Arrange
  await page.goto('/westside/goals');

  // Act
  await page.locator('[data-testid="goal-card"]').first().click();

  // Assert
  await expect(page).toHaveURL(/\/goals\/[a-z0-9-]+/);
  await expect(page.locator('h1')).toBeVisible();
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
await page.waitForLoadState('networkidle');
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
