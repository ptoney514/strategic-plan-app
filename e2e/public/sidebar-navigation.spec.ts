import { test, expect } from '@playwright/test';

/**
 * Sidebar Navigation Tests
 *
 * Tests for the new sidebar-based navigation on public district pages.
 * Covers expand/collapse behavior, 3-level nested navigation, and status indicators.
 */

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we're not authenticated and start fresh
    await page.context().clearCookies();
    // Navigate to westside district overview
    await page.goto('/westside');
    // Wait for objectives to load (data-testid added to objective buttons)
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });
  });

  test.describe('Overview Page', () => {
    test('should show sidebar with objectives list', async ({ page }) => {
      // Desktop sidebar should be visible (use first() to avoid strict mode violation)
      const sidebar = page.locator('aside').first();
      await expect(sidebar).toBeVisible();

      // Should show "Strategic Goals" heading (use first() for desktop sidebar)
      await expect(page.locator('text=Strategic Goals').first()).toBeVisible();

      // Should show Overview link (use first() for desktop sidebar)
      await expect(page.locator('text=Overview').first()).toBeVisible();
    });

    test('should highlight Overview link when on overview page', async ({ page }) => {
      // Desktop sidebar overview link (first() to target desktop)
      const overviewLink = page.locator('a:has-text("Overview")').first();
      await expect(overviewLink).toBeVisible();
      await expect(overviewLink).toHaveClass(/bg-red-50/);
    });

    test('should show objectives with number badges', async ({ page }) => {
      // Wait for objectives to load
      await page.waitForTimeout(1000);

      // Should show numbered objectives (1, 2, 3, etc.)
      const objectiveButtons = page.locator('nav button');
      const count = await objectiveButtons.count();
      expect(count).toBeGreaterThan(0);

      // First objective should have number badge
      const firstBadge = page.locator('nav button span:has-text("1")').first();
      await expect(firstBadge).toBeVisible();
    });

    test('should show status indicators under objectives', async ({ page }) => {
      // Wait for objectives to load
      await page.waitForTimeout(1000);

      // Should show status text like "On Target", "Needs Attention", etc.
      const statusTexts = ['On Target', 'Needs Attention', 'Off Track', 'Not Started'];
      let foundStatus = false;

      for (const status of statusTexts) {
        const statusElement = page.locator(`text="${status}"`).first();
        const isVisible = await statusElement.isVisible().catch(() => false);
        if (isVisible) {
          foundStatus = true;
          break;
        }
      }

      expect(foundStatus).toBe(true);
    });
  });

  test.describe('Objective Expand/Collapse', () => {
    test('should expand objective when clicked', async ({ page }) => {
      // Wait for objectives to load
      await page.waitForTimeout(1000);

      // Find first objective button (contains number badge and title)
      const firstObjective = page.locator('nav button').first();
      await expect(firstObjective).toBeVisible();

      // Get initial chevron rotation
      const chevron = firstObjective.locator('svg[class*="lucide-chevron"]');
      const initialClasses = await chevron.getAttribute('class');
      const wasExpanded = initialClasses?.includes('rotate-90');

      // Click to toggle
      await firstObjective.click();

      // Wait for state change
      await page.waitForTimeout(500);

      // Chevron should have toggled rotation
      const newClasses = await chevron.getAttribute('class');
      const isNowExpanded = newClasses?.includes('rotate-90');

      expect(isNowExpanded).toBe(!wasExpanded);
    });

    test('should show child goals when objective is expanded', async ({ page }) => {
      // Wait for objectives to load
      await page.waitForTimeout(1000);

      // Click first objective to expand
      const firstObjective = page.locator('nav button').first();
      await firstObjective.click();

      // Wait for expansion animation
      await page.waitForTimeout(500);

      // Should show child goals (Level 1) - they have goal numbers like "1.1"
      const childGoalPattern = page.locator('nav >> text=/^\\d+\\.\\d+\\s/');
      const childCount = await childGoalPattern.count();

      // Log what we found for debugging
      console.log(`Found ${childCount} child goals after expanding`);

      expect(childCount).toBeGreaterThan(0);
    });

    test('should collapse objective when clicked again', async ({ page }) => {
      // Wait for objectives to load
      await page.waitForTimeout(1000);

      // Click first objective to expand
      const firstObjective = page.locator('nav button').first();
      await firstObjective.click();
      await page.waitForTimeout(500);

      // Verify it's expanded (chevron rotated)
      const chevron = firstObjective.locator('svg[class*="lucide-chevron"]');
      await expect(chevron).toHaveClass(/rotate-90/);

      // Click again to collapse
      await firstObjective.click();
      await page.waitForTimeout(500);

      // Chevron should no longer be rotated
      const classAfterCollapse = await chevron.getAttribute('class');
      expect(classAfterCollapse).not.toContain('rotate-90');
    });

    test('should only expand one objective at a time', async ({ page }) => {
      // Use desktop sidebar only (first aside element)
      const desktopSidebar = page.locator('aside').first();
      const objectiveButtons = desktopSidebar.locator('[data-testid^="objective-"]');
      const count = await objectiveButtons.count();

      if (count < 2) {
        test.skip();
        return;
      }

      // Click first objective
      await objectiveButtons.nth(0).click();
      await page.waitForTimeout(500);

      // Verify first is expanded
      const firstChevron = objectiveButtons.nth(0).locator('svg[class*="lucide-chevron"]');
      await expect(firstChevron).toHaveClass(/rotate-90/);

      // Click second objective
      await objectiveButtons.nth(1).click();
      await page.waitForTimeout(500);

      // Second should be expanded
      const secondChevron = objectiveButtons.nth(1).locator('svg[class*="lucide-chevron"]');
      await expect(secondChevron).toHaveClass(/rotate-90/);

      // First should be collapsed
      const firstClassAfter = await firstChevron.getAttribute('class');
      expect(firstClassAfter).not.toContain('rotate-90');
    });
  });

  test.describe('Level 2 Navigation (3-Level Nested)', () => {
    test('should show Level 2 goals when Level 1 goal with children is expanded', async ({ page }) => {
      // Wait for objectives to load
      await page.waitForTimeout(1000);

      // Expand first objective
      const firstObjective = page.locator('nav button').first();
      await firstObjective.click();
      await page.waitForTimeout(500);

      // Find a Level 1 goal that has children (it will have a chevron)
      const level1WithChildren = page.locator('nav >> button:has(svg[class*="lucide-chevron"])').nth(1);
      const hasLevel1 = await level1WithChildren.count() > 0;

      if (!hasLevel1) {
        console.log('No Level 1 goals with children found - skipping test');
        test.skip();
        return;
      }

      // Click Level 1 goal to expand
      await level1WithChildren.click();
      await page.waitForTimeout(500);

      // Should show Level 2 initiatives (goal numbers like "1.1.1")
      const level2Pattern = page.locator('nav >> text=/^\\d+\\.\\d+\\.\\d+\\s/');
      const level2Count = await level2Pattern.count();

      console.log(`Found ${level2Count} Level 2 goals`);
      expect(level2Count).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation Links', () => {
    test('should navigate to goal detail when clicking child goal link', async ({ page }) => {
      // Wait for objectives to load
      await page.waitForTimeout(1000);

      // Expand first objective
      const firstObjective = page.locator('nav button').first();
      await firstObjective.click();
      await page.waitForTimeout(500);

      // Find a child goal link (not a button - links don't have children to expand)
      const childLink = page.locator('nav >> a[href*="/goal/"]').first();
      const hasLink = await childLink.count() > 0;

      if (!hasLink) {
        console.log('No child goal links found');
        test.skip();
        return;
      }

      // Click the link
      await childLink.click();

      // Should navigate to goal detail page
      await expect(page).toHaveURL(/\/westside\/goal\//);
    });

    test('should navigate to Overview when clicking Overview link', async ({ page }) => {
      // Desktop sidebar locator
      const desktopSidebar = page.locator('aside').first();

      // Expand first objective and click a child goal
      const firstObjective = desktopSidebar.locator('[data-testid^="objective-"]').first();
      await firstObjective.click();
      await page.waitForTimeout(500);

      const childLink = desktopSidebar.locator('a[href*="/goal/"]').first();
      const hasLink = await childLink.count() > 0;

      if (hasLink) {
        await childLink.click();
        await page.waitForTimeout(500);
      }

      // Now click Overview to go back (use first() for desktop sidebar)
      const overviewLink = desktopSidebar.locator('a:has-text("Overview")');
      await overviewLink.click();

      await expect(page).toHaveURL(/\/westside$/);
    });
  });

  test.describe('Hover Tooltips', () => {
    test('should show full title on hover for truncated text', async ({ page }) => {
      // Wait for objectives to load
      await page.waitForTimeout(1000);

      // Find an objective title span with title attribute
      const titleSpan = page.locator('nav button span[title]').first();
      const hasTitle = await titleSpan.count() > 0;

      if (!hasTitle) {
        console.log('No truncated titles with tooltip found');
        test.skip();
        return;
      }

      // Get the title attribute value
      const titleAttr = await titleSpan.getAttribute('title');
      expect(titleAttr).toBeTruthy();
      expect(titleAttr?.length).toBeGreaterThan(0);
    });
  });

});
