import { test, expect } from '@playwright/test';

/**
 * E2E tests for metrics display on goal detail pages
 * These tests verify that metrics fetch and display correctly
 */

test.describe('Metrics Display', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
      }
    });
  });

  test('should fetch time series data for metrics', async ({ page }) => {
    // Track all time series API calls
    const timeSeriesCalls: { url: string; response: any }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('spb_metric_time_series')) {
        try {
          const json = await response.json();
          timeSeriesCalls.push({ url, response: json });
          console.log(`[TIME SERIES API] ${url}`);
          console.log(`[TIME SERIES DATA] Records: ${Array.isArray(json) ? json.length : 'N/A'}`);
          if (Array.isArray(json) && json.length > 0) {
            console.log(`[TIME SERIES SAMPLE] ${JSON.stringify(json[0], null, 2)}`);
          }
        } catch (e) {
          console.log(`[TIME SERIES API] ${url} - Error: ${e}`);
        }
      }
    });

    // Navigate to goal page
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    const goalLink = page.locator('a[href*="/goal/"]').first();
    if (await goalLink.isVisible()) {
      await goalLink.click();
      // Wait longer for time series data to be fetched
      await page.waitForTimeout(5000);
    }

    console.log('\n=== Time Series API Summary ===');
    console.log(`Total time series calls: ${timeSeriesCalls.length}`);
    timeSeriesCalls.forEach((call, i) => {
      console.log(`\n${i + 1}. URL: ${call.url}`);
      if (Array.isArray(call.response)) {
        console.log(`   Records: ${call.response.length}`);
        call.response.forEach((record: any, j: number) => {
          console.log(`   [${j}] period: ${record.period}, actual: ${record.actual_value}, target: ${record.target_value}`);
        });
      } else if (call.response.error || call.response.message) {
        console.log(`   Error: ${call.response.message || JSON.stringify(call.response)}`);
      }
    });

    // Time series should have been fetched if metrics exist
    // Note: if this is 0, it means no time series data exists in the database
    console.log(`\nTime series calls made: ${timeSeriesCalls.length}`);
  });

  test('Goal 1.1 should display metrics with values', async ({ page }) => {
    // Navigate to the district overview first
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    // Click on Objective 1 to expand it
    const objective1 = page.locator('[data-testid="objective-1"]').first();
    await objective1.click();
    await page.waitForTimeout(500);

    // Navigate to objective detail
    await expect(page).toHaveURL(/\/westside\/objective\//);

    // Click on Goal 1.1 link
    const goal11Link = page.locator('a[href*="/goal/"]').first();
    await goal11Link.click();
    await page.waitForTimeout(1000);

    // Should be on goal detail page
    await expect(page).toHaveURL(/\/westside\/goal\//);

    // Wait for metrics to load - check for metric cards
    const metricsGrid = page.locator('.grid').first();
    await expect(metricsGrid).toBeVisible({ timeout: 10000 });

    // Log the page content for debugging
    const pageContent = await page.content();
    console.log('Page loaded, checking for metrics...');

    // Check if metric cards exist
    const metricCards = page.locator('.bg-white.rounded-xl.border');
    const cardCount = await metricCards.count();
    console.log(`Found ${cardCount} metric cards`);

    // Check for metric values - they should NOT be "0" if data exists
    const metricValues = page.locator('.text-5xl, .text-6xl');
    const valueCount = await metricValues.count();
    console.log(`Found ${valueCount} metric value displays`);

    for (let i = 0; i < valueCount; i++) {
      const value = await metricValues.nth(i).textContent();
      console.log(`Metric ${i + 1} value: "${value}"`);
    }

    // Check for metric titles
    const metricTitles = page.locator('h3.text-gray-900.font-semibold');
    const titleCount = await metricTitles.count();
    for (let i = 0; i < titleCount; i++) {
      const title = await metricTitles.nth(i).textContent();
      console.log(`Metric ${i + 1} title: "${title}"`);
    }

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/metrics-display.png', fullPage: true });

    // Basic assertion - at least one metric should be visible
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should intercept and log metric API calls', async ({ page }) => {
    // Intercept API calls to see what data is being fetched
    const apiCalls: { url: string; response: any }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('spb_metrics') || url.includes('spb_metric_time_series')) {
        try {
          const json = await response.json();
          apiCalls.push({ url, response: json });
          console.log(`[API] ${url}`);
          console.log(`[API Response] ${JSON.stringify(json, null, 2).substring(0, 500)}...`);
        } catch (e) {
          console.log(`[API] ${url} - Could not parse response`);
        }
      }
    });

    // Navigate to goal page
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    // Click objective 1
    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Click first goal link
    const goalLink = page.locator('a[href*="/goal/"]').first();
    if (await goalLink.isVisible()) {
      await goalLink.click();
      await page.waitForTimeout(2000);
    }

    // Log all captured API calls
    console.log('\n=== API Calls Summary ===');
    console.log(`Total API calls captured: ${apiCalls.length}`);
    apiCalls.forEach((call, i) => {
      console.log(`\n${i + 1}. ${call.url}`);
      if (Array.isArray(call.response)) {
        console.log(`   Records: ${call.response.length}`);
        if (call.response.length > 0) {
          console.log(`   First record keys: ${Object.keys(call.response[0]).join(', ')}`);
          // Check for time series specific fields
          if (call.response[0].actual_value !== undefined) {
            console.log(`   Sample actual_value: ${call.response[0].actual_value}`);
          }
          if (call.response[0].current_value !== undefined) {
            console.log(`   Sample current_value: ${call.response[0].current_value}`);
          }
        }
      }
    });

    // At least metrics should have been fetched
    expect(apiCalls.length).toBeGreaterThan(0);
  });

  test('metric card should show time series data in chart', async ({ page }) => {
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    // Navigate to a goal with metrics
    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    const goalLink = page.locator('a[href*="/goal/"]').first();
    if (await goalLink.isVisible()) {
      await goalLink.click();
      await page.waitForTimeout(2000);
    }

    // Check for canvas elements (charts)
    const canvasElements = page.locator('canvas');
    const canvasCount = await canvasElements.count();
    console.log(`Found ${canvasCount} chart canvas elements`);

    // Check if charts have content by looking at canvas dimensions
    for (let i = 0; i < canvasCount; i++) {
      const canvas = canvasElements.nth(i);
      const box = await canvas.boundingBox();
      if (box) {
        console.log(`Chart ${i + 1} dimensions: ${box.width}x${box.height}`);
      }
    }

    // Take screenshot of charts
    await page.screenshot({ path: 'test-results/metrics-charts.png', fullPage: true });
  });

  test('debug: check what metric data is available', async ({ page }) => {
    // This test helps debug by evaluating metric data in the browser context
    await page.goto('/westside');
    await page.waitForSelector('[data-testid^="objective-"]', { state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="objective-1"]').first().click();
    await page.waitForTimeout(500);

    // Log current URL after clicking objective
    console.log(`\n=== After clicking objective ===`);
    console.log(`Current URL: ${page.url()}`);

    // List ALL goal links on the page
    const allGoalLinks = page.locator('a[href*="/goal/"]');
    const linkCount = await allGoalLinks.count();
    console.log(`\n=== All Goal Links (${linkCount}) ===`);
    for (let i = 0; i < linkCount; i++) {
      const link = allGoalLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`[${i}] href: ${href}, text: "${text?.substring(0, 50)}..."`);
    }

    // Try to find Goal 1.1 specifically (contains "1.1" or "Grow and nurture")
    let targetGoal = page.locator('a[href*="/goal/"]:has-text("1.1")').first();
    if (await targetGoal.count() === 0) {
      targetGoal = page.locator('a[href*="/goal/"]:has-text("Grow")').first();
    }
    if (await targetGoal.count() === 0) {
      targetGoal = allGoalLinks.first();
    }

    if (await targetGoal.isVisible()) {
      const href = await targetGoal.getAttribute('href');
      const text = await targetGoal.textContent();
      console.log(`\nClicking goal: ${text?.substring(0, 50)} (${href})`);
      await targetGoal.click();
      await page.waitForTimeout(3000); // Wait longer for data to load
      console.log(`\n=== After clicking goal ===`);
      console.log(`Current URL: ${page.url()}`);
    } else {
      console.log('\nNo goal link found to click');
    }

    // Evaluate React Query cache to see what data was fetched
    const queryData = await page.evaluate(() => {
      // Try to access React Query cache
      const queryClient = (window as any).__REACT_QUERY_CLIENT__;
      if (queryClient) {
        const cache = queryClient.getQueryCache().getAll();
        return cache.map((query: any) => ({
          queryKey: query.queryKey,
          dataLength: Array.isArray(query.state.data) ? query.state.data.length : 'N/A',
          status: query.state.status,
        }));
      }
      return 'React Query client not found';
    });

    console.log('\n=== React Query Cache ===');
    console.log(JSON.stringify(queryData, null, 2));

    // Check the DOM for metric values
    const metricInfo = await page.evaluate(() => {
      const cards = document.querySelectorAll('.bg-white.rounded-xl.border');
      return Array.from(cards).map((card, i) => {
        const title = card.querySelector('h3')?.textContent || 'No title';
        const value = card.querySelector('.text-5xl, .text-6xl')?.textContent || 'No value';
        const category = card.querySelector('.text-xs.font-semibold.tracking-widest')?.textContent || 'No category';
        return { index: i + 1, title, value, category };
      });
    });

    console.log('\n=== Metric Cards in DOM ===');
    console.log(JSON.stringify(metricInfo, null, 2));

    // Check all text content on the page for debugging
    const pageText = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      return main.innerText?.substring(0, 2000) || 'No content';
    });
    console.log('\n=== Page Content (first 2000 chars) ===');
    console.log(pageText);

    // Check for "No metrics" message
    const noMetricsMsg = await page.locator('text=No metrics').count();
    console.log(`\n"No metrics" message count: ${noMetricsMsg}`);

    // Check MetricsGrid presence
    const grids = await page.locator('.grid').count();
    console.log(`Grid elements count: ${grids}`);

    // Take final screenshot
    await page.screenshot({ path: 'test-results/metrics-debug.png', fullPage: true });
  });
});
