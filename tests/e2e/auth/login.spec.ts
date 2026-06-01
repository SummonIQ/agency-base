import { test, expect } from '@playwright/test';
import { LoginPage } from '../utils/pages/login.page';
import { TEST_USER } from '../utils/test-helpers';

test.describe('Authentication - Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should display login form', async ({ page }) => {
    // Check all form elements are visible
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/signup"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click submit without filling fields
    await loginPage.login('', '');
    
    // Check for validation messages
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await loginPage.login('invalid-email', 'password123');
    
    // Check for email validation message
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should show error for incorrect credentials', async ({ page }) => {
    await loginPage.login('wrong@example.com', 'wrongpassword');
    
    // Check for error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid email or password');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Use test user credentials
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    
    // Wait for redirect to dashboard
    await loginPage.waitForLoginSuccess();
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/(dashboard|overview)/);
    
    // Check for user menu indicating logged in state
    await expect(page.locator('[data-testid="user-menu-trigger"]')).toBeVisible();
  });

  test('should redirect to requested page after login', async ({ page }) => {
    // Navigate to a protected page
    await page.goto('/jobs');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login\?redirect=/);
    
    // Login
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    
    // Should be redirected back to jobs page
    await expect(page).toHaveURL('/jobs');
  });

  test('should handle login with remember me checked', async ({ page }) => {
    // Check remember me checkbox
    await page.check('input[name="rememberMe"]');
    
    // Login
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await loginPage.waitForLoginSuccess();
    
    // Check that session cookie has extended expiry
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'));
    expect(sessionCookie).toBeDefined();
    
    // Cookie should expire in more than 7 days
    if (sessionCookie) {
      const expiryDate = new Date(sessionCookie.expires * 1000);
      const daysDiff = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(7);
    }
  });

  test('should navigate to signup page', async ({ page }) => {
    await loginPage.clickSignupLink();
    await expect(page).toHaveURL('/signup');
  });

  test('should show password in plain text when show password is clicked', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const showPasswordButton = page.locator('[data-testid="toggle-password-visibility"]');
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Type password
    await passwordInput.fill('mypassword');
    
    // Click show password
    await showPasswordButton.click();
    
    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await showPasswordButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle session timeout gracefully', async ({ page, context }) => {
    // Login first
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await loginPage.waitForLoginSuccess();
    
    // Clear session cookies to simulate timeout
    await context.clearCookies();
    
    // Try to navigate to protected page
    await page.goto('/jobs');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
    
    // Should show session expired message
    await expect(page.locator('text=Your session has expired')).toBeVisible();
  });
});