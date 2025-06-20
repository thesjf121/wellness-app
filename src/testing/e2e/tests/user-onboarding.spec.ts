import { test, expect } from '@playwright/test';

test.describe('User Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session data
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should complete full onboarding flow', async ({ page }) => {
    // Landing page
    await expect(page).toHaveTitle(/WellnessApp/);
    await expect(page.locator('h1')).toContainText('Welcome to Your Wellness Journey');

    // Start onboarding
    await page.click('button:text("Get Started")');
    await expect(page).toHaveURL(/\/onboarding/);

    // Step 1: Personal Information
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:text("Next")');

    // Step 2: Health Goals
    await page.check('input[value="weight_loss"]');
    await page.check('input[value="fitness_improvement"]');
    await page.fill('input[name="dailyStepGoal"]', '8000');
    await page.click('button:text("Next")');

    // Step 3: Preferences
    await page.check('input[name="dailyReminders"]');
    await page.selectOption('select[name="reminderTime"]', '09:00');
    await page.click('button:text("Next")');

    // Step 4: Welcome Video
    await expect(page.locator('video')).toBeVisible();
    await page.click('button:text("Skip Video")');

    // Complete onboarding
    await page.click('button:text("Complete Setup")');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify dashboard loads with user data
    await expect(page.locator('h1')).toContainText('Welcome back, Test');
  });

  test('should handle skip onboarding option', async ({ page }) => {
    await page.goto('/onboarding');
    
    await page.click('button:text("Skip for now")');
    
    // Should show confirmation modal
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal')).toContainText('Skip onboarding');
    
    await page.click('button:text("Yes, skip")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Try to proceed without filling required fields
    await page.click('button:text("Next")');
    
    await expect(page.locator('.error-message')).toContainText('First name is required');
    await expect(page.locator('.error-message')).toContainText('Email is required');
  });

  test('should save progress and allow resume', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Fill first step
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:text("Next")');
    
    // Navigate away
    await page.goto('/');
    
    // Return to onboarding
    await page.goto('/onboarding');
    
    // Should resume from step 2
    await expect(page.locator('.progress-indicator')).toContainText('Step 2 of 4');
    
    // Previous data should be preserved
    await page.click('button:text("Previous")');
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Test');
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for proper form labeling
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should work on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile');
    
    await page.goto('/onboarding');
    
    // Check mobile-specific UI elements
    await expect(page.locator('.mobile-header')).toBeVisible();
    
    // Test touch interactions
    await page.tap('input[name="firstName"]');
    await page.fill('input[name="firstName"]', 'Test');
    
    // Verify mobile keyboard handling
    await expect(page.locator('input[name="firstName"]')).toBeFocused();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/users**', route => route.abort());
    
    await page.goto('/onboarding');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:text("Next")');
    
    // Should show error message
    await expect(page.locator('.error-message')).toContainText('Network error');
    
    // Should allow retry
    await expect(page.locator('button:text("Retry")')).toBeVisible();
  });
});