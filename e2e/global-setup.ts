import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(import.meta.dirname, '.auth');
const DISTRICT_ADMIN_STATE = path.join(AUTH_DIR, 'district-admin.json');
const SYSTEM_ADMIN_STATE = path.join(AUTH_DIR, 'system-admin.json');

/**
 * Global setup: authenticate test users via API and save storageState.
 * Runs once before all test projects that depend on `setup`.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL
    ?? process.env.PLAYWRIGHT_BASE_URL
    ?? 'http://localhost:5174';

  // Ensure auth directory exists
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const districtEmail = process.env.TEST_DISTRICT_ADMIN_EMAIL || 'admin@westside66.org';
  const districtPassword = process.env.TEST_DISTRICT_ADMIN_PASSWORD || 'Westside123!';
  const systemEmail = process.env.TEST_SYSTEM_ADMIN_EMAIL || 'sysadmin@stratadash.com';
  const systemPassword = process.env.TEST_SYSTEM_ADMIN_PASSWORD || 'Stratadash123!';

  const browser = await chromium.launch();

  // --- District Admin ---
  try {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();

    const response = await page.request.post('/api/auth/sign-in/email', {
      data: { email: districtEmail, password: districtPassword },
    });

    if (response.ok()) {
      await ctx.storageState({ path: DISTRICT_ADMIN_STATE });
      console.log('  District admin auth state saved');
    } else {
      console.warn(`  District admin login failed (${response.status()}). Tests requiring this role will be skipped.`);
    }

    await ctx.close();
  } catch (err) {
    console.warn('  District admin login error:', (err as Error).message);
  }

  // --- System Admin ---
  try {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();

    const response = await page.request.post('/api/auth/sign-in/email', {
      data: { email: systemEmail, password: systemPassword },
    });

    if (response.ok()) {
      await ctx.storageState({ path: SYSTEM_ADMIN_STATE });
      console.log('  System admin auth state saved');
    } else {
      console.warn(`  System admin login failed (${response.status()}). Tests requiring this role will be skipped.`);
    }

    await ctx.close();
  } catch (err) {
    console.warn('  System admin login error:', (err as Error).message);
  }

  await browser.close();
}

export default globalSetup;
