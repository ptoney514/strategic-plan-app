import { test, expect } from '@playwright/test';

/**
 * Contact Form E2E Tests
 *
 * Verify the contact form modal functionality on the marketing landing page.
 * Tests modal opening, form filling, submission, and closing behaviors.
 */

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the marketing landing page (root domain)
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should open contact modal when clicking "Get Started" button in nav', async ({ page }) => {
    // Find and click the "Get Started" button in the navigation
    const getStartedButton = page.locator('nav button:has-text("Get Started")');
    await getStartedButton.click();

    // Verify modal is open
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();
    await expect(page.locator('#contact-email')).toBeVisible();
  });

  test('should open contact modal when clicking "Schedule a Demo" button', async ({ page }) => {
    // Find and click the "Schedule a Demo" button in the hero section
    const scheduleButton = page.locator('button:has-text("Schedule a Demo")');
    await scheduleButton.click();

    // Verify modal is open
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();
  });

  test('should open contact modal when clicking "Contact Us" button in CTA section', async ({
    page,
  }) => {
    // Scroll to the CTA section and click "Contact Us"
    const contactButton = page.locator('section button:has-text("Contact Us")');
    await contactButton.scrollIntoViewIfNeeded();
    await contactButton.click();

    // Verify modal is open
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();
  });

  test('should display all form fields in the modal', async ({ page }) => {
    // Open the modal
    await page.locator('button:has-text("Schedule a Demo")').click();

    // Verify all form fields are present
    await expect(page.locator('#contact-email')).toBeVisible();
    await expect(page.locator('#contact-firstName')).toBeVisible();
    await expect(page.locator('#contact-lastName')).toBeVisible();
    await expect(page.locator('#contact-organization')).toBeVisible();
    await expect(page.locator('#contact-topic')).toBeVisible();
    await expect(page.locator('#contact-phone')).toBeVisible();
    await expect(page.locator('#contact-message')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Submit")')).toBeVisible();
  });

  test('should close modal when clicking close button', async ({ page }) => {
    // Open the modal
    await page.locator('button:has-text("Schedule a Demo")').click();
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();

    // Click the close button (X icon)
    await page.locator('button[aria-label="Close"]').click();

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Contact Us")')).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    // Open the modal
    await page.locator('button:has-text("Schedule a Demo")').click();
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();

    // Click the backdrop (the dark overlay behind the modal)
    // The backdrop is the first child of the fixed container
    await page.locator('.fixed.inset-0 > .absolute.inset-0').click({ force: true });

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Contact Us")')).not.toBeVisible();
  });

  test('should close modal when pressing Escape key', async ({ page }) => {
    // Open the modal
    await page.locator('button:has-text("Schedule a Demo")').click();
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Contact Us")')).not.toBeVisible();
  });

  test('should fill out the contact form', async ({ page }) => {
    // Open the modal
    await page.locator('button:has-text("Schedule a Demo")').click();

    // Fill out the form
    await page.locator('#contact-email').fill('john.doe@district.edu');
    await page.locator('#contact-firstName').fill('John');
    await page.locator('#contact-lastName').fill('Doe');
    await page.locator('#contact-organization').fill('Westside School District');
    await page.locator('#contact-topic').selectOption('Schedule a demo');
    await page.locator('#contact-phone').fill('555-123-4567');
    await page.locator('#contact-message').fill('We are interested in learning more about StrataDash for our district.');

    // Verify values are filled
    await expect(page.locator('#contact-email')).toHaveValue('john.doe@district.edu');
    await expect(page.locator('#contact-firstName')).toHaveValue('John');
    await expect(page.locator('#contact-lastName')).toHaveValue('Doe');
    await expect(page.locator('#contact-organization')).toHaveValue('Westside School District');
    await expect(page.locator('#contact-topic')).toHaveValue('Schedule a demo');
    await expect(page.locator('#contact-phone')).toHaveValue('555-123-4567');
    await expect(page.locator('#contact-message')).toHaveValue(
      'We are interested in learning more about StrataDash for our district.'
    );
  });

  test('should show topic dropdown options', async ({ page }) => {
    // Open the modal
    await page.locator('button:has-text("Schedule a Demo")').click();

    // Check dropdown options
    const topicSelect = page.locator('#contact-topic');
    await expect(topicSelect.locator('option')).toHaveCount(6); // Default + 5 options

    // Verify specific options exist
    await expect(topicSelect.locator('option:has-text("Schedule a demo")')).toBeVisible();
    await expect(topicSelect.locator('option:has-text("Pricing information")')).toBeVisible();
    await expect(topicSelect.locator('option:has-text("Technical questions")')).toBeVisible();
    await expect(topicSelect.locator('option:has-text("Partnership inquiry")')).toBeVisible();
    await expect(topicSelect.locator('option:has-text("Other")')).toBeVisible();
  });

  test('should show required field validation', async ({ page }) => {
    // Open the modal
    await page.locator('button:has-text("Schedule a Demo")').click();

    // Try to submit empty form
    await page.locator('button[type="submit"]:has-text("Submit")').click();

    // The form should not submit (browser validation will prevent it)
    // The modal should still be open
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();

    // Email field should show validation (required)
    const emailInput = page.locator('#contact-email');
    const isInvalid = await emailInput.evaluate(
      (el) => !(el as HTMLInputElement).checkValidity()
    );
    expect(isInvalid).toBe(true);
  });

  // Note: This test requires the database to be set up and accessible
  // It will be skipped if the database connection is not available
  test.skip('should submit form successfully and show thank you message', async ({ page }) => {
    // Open the modal
    await page.locator('button:has-text("Schedule a Demo")').click();

    // Fill out all required fields
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-firstName').fill('Test');
    await page.locator('#contact-lastName').fill('User');
    await page.locator('#contact-organization').fill('Test Organization');
    await page.locator('#contact-topic').selectOption('Schedule a demo');

    // Submit the form
    await page.locator('button[type="submit"]:has-text("Submit")').click();

    // Wait for submission and verify success message
    await expect(page.locator('text="Thank you!"')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text="We\'ve received your message"')).toBeVisible();
  });
});
