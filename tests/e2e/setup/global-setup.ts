import { chromium, FullConfig } from '@playwright/test';
import { TEST_USER } from '../utils/test-helpers';

async function globalSetup(config: FullConfig) {
  // You can set up test data here if needed
  console.log('Running global setup...');
  
  // Create a test user in the database if needed
  // This would require database connection setup
  
  // Store any auth state if needed
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // You could perform login here and save auth state
    // await page.goto(config.use.baseURL + '/login');
    // await page.fill('input[name="email"]', TEST_USER.email);
    // await page.fill('input[name="password"]', TEST_USER.password);
    // await page.click('button[type="submit"]');
    // await page.waitForURL(/dashboard/);
    
    // Save storage state
    // await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
    
    console.log('Global setup completed');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;