import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Login Page
 *
 * Encapsulates login page interactions for reusability across tests.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  async goto(params?: string) {
    const url = params ? `/login${params}` : '/login';
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Login and wait for navigation away from /login */
  async loginAndWait(email: string, password: string, timeout = 15000) {
    await this.login(email, password);
    await this.page.waitForURL(url => !new URL(url).pathname.startsWith('/login'), { timeout });
  }

  async expectLoginSuccess() {
    await this.page.waitForURL(url => !new URL(url).pathname.startsWith('/login'), { timeout: 15000 });
  }

  async expectLoginFailure() {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  }
}
