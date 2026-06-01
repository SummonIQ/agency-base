import { Page, expect } from '@playwright/test';
import path from 'path';

export const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#',
  name: 'Test User',
};

export const TEST_TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
};

/**
 * Login helper function
 */
export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Fill in login form
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|overview)/, { 
    timeout: TEST_TIMEOUTS.MEDIUM 
  });
  
  // Verify we're logged in
  await expect(page).toHaveURL(/\/(dashboard|overview)/);
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  await page.goto('/');
  
  // Click user menu
  await page.click('[data-testid="user-menu-trigger"]');
  
  // Click logout
  await page.click('[data-testid="logout-button"]');
  
  // Wait for redirect to login
  await page.waitForURL('/login');
}

/**
 * Wait for and dismiss any toasts
 */
export async function dismissToasts(page: Page) {
  const toasts = page.locator('[data-testid="toast"]');
  const count = await toasts.count();
  
  for (let i = 0; i < count; i++) {
    await toasts.nth(i).click();
  }
}

/**
 * Upload a test file
 */
export async function uploadFile(page: Page, selector: string, fileName: string) {
  const filePath = path.join(__dirname, '..', 'fixtures', fileName);
  await page.setInputFiles(selector, filePath);
}

/**
 * Wait for API request to complete
 */
export async function waitForAPI(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern) && response.status() === 200;
    }
    return urlPattern.test(url) && response.status() === 200;
  });
}

/**
 * Fill in a form field with proper waiting
 */
export async function fillField(page: Page, selector: string, value: string) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.fill(selector, '');
  await page.fill(selector, value);
}

/**
 * Click with retry logic
 */
export async function clickWithRetry(page: Page, selector: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.click(selector, { timeout: TEST_TIMEOUTS.SHORT });
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { 
      timeout: TEST_TIMEOUTS.SHORT,
      state: 'visible' 
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a mock job posting for testing
 */
export function createMockJob(overrides = {}) {
  return {
    title: 'Senior Software Engineer',
    company: 'Test Company Inc.',
    location: 'San Francisco, CA',
    description: 'We are looking for a talented software engineer...',
    requirements: [
      '5+ years of experience',
      'React and TypeScript expertise',
      'Strong communication skills',
    ],
    salary: '$150,000 - $200,000',
    ...overrides,
  };
}

/**
 * Create a mock resume for testing
 */
export function createMockResume(overrides = {}) {
  return {
    name: 'Test Resume',
    content: `
# John Doe
## Software Engineer

### Experience
- Senior Software Engineer at Tech Corp (2020-Present)
- Software Engineer at StartUp Inc (2018-2020)

### Skills
- JavaScript, TypeScript, React, Node.js
- Python, Django, PostgreSQL
- AWS, Docker, Kubernetes

### Education
- BS Computer Science, University of Example (2018)
    `,
    ...overrides,
  };
}