import { Page, Locator } from '@playwright/test';

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
    // TODO: Update these selectors based on actual login form
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoginSuccess() {
    // Wait for navigation away from login page
    await this.page.waitForURL(/\/(?!login)/, { timeout: 5000 });
  }

  async expectLoginFailure() {
    await this.errorMessage.isVisible();
  }
}
