import { chromium } from 'playwright';

async function testNavigation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3100';
  const results = [];

  // Pages to test (authenticated routes)
  const pagesToTest = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/clients', name: 'Clients' },
    { path: '/projects', name: 'Projects' },
    { path: '/agency-leads', name: 'Agency Leads' },
    { path: '/invoices', name: 'Invoices' },
    { path: '/team-members', name: 'Team Members' },
    { path: '/business-tools', name: 'Business Tools' },
    { path: '/lead-generation', name: 'Lead Generation' },
    { path: '/lead-generation/search', name: 'Lead Search' },
    { path: '/lead-generation/campaigns', name: 'Lead Campaigns' },
    { path: '/email-automation', name: 'Email Automation' },
    { path: '/email-automation/campaigns', name: 'Email Campaigns' },
    { path: '/email-automation/templates', name: 'Email Templates' },
    { path: '/email-automation/subscribers', name: 'Email Subscribers' },
    { path: '/recruiting', name: 'Recruiting' },
    { path: '/recruiting/candidates', name: 'Candidates' },
    { path: '/recruiting/applications', name: 'Applications' },
    { path: '/recruiting/talent-pools', name: 'Talent Pools' },
    { path: '/business-intelligence', name: 'Business Intelligence' },
    { path: '/business-intelligence/metrics', name: 'Metrics' },
    { path: '/business-intelligence/benchmarks', name: 'Benchmarks' },
    { path: '/revenue-analytics', name: 'Revenue Analytics' },
    { path: '/revenue-analytics/revenue', name: 'Revenue Overview' },
    { path: '/revenue-analytics/forecasts', name: 'Forecasts' },
    { path: '/execution-calendar', name: 'Execution Calendar' },
    { path: '/action-plan', name: 'Action Plan' },
    { path: '/linkedin-integration', name: 'LinkedIn Integration' },
    { path: '/business-documentation', name: 'Business Documentation' },
    { path: '/notifications', name: 'Notifications' },
    { path: '/settings/notifications', name: 'Notification Settings' },
  ];

  console.log('🔍 Starting navigation test...\n');

  // First, go to login page
  try {
    console.log('📝 Navigating to login page...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });

    // Check if we're on login page
    const loginTitle = await page.title();
    console.log(`✅ Login page loaded: ${loginTitle}\n`);

    // Since we need authentication, we'll check if pages redirect to login properly
    console.log('🔐 Testing authenticated routes (should redirect to login)...\n');
  } catch (error) {
    console.log(`❌ Failed to load login page: ${error.message}\n`);
  }

  // Test each page
  for (const pageInfo of pagesToTest) {
    try {
      console.log(`📄 Testing: ${pageInfo.name} (${pageInfo.path})`);

      const response = await page.goto(`${baseUrl}${pageInfo.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      // Check response status
      const status = response.status();

      // Check for console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Wait a bit to catch any async errors
      await page.waitForTimeout(1000);

      // Get page title and URL
      const title = await page.title();
      const currentUrl = page.url();

      // Check if redirected to login (expected for authenticated routes)
      const redirectedToLogin = currentUrl.includes('/login');

      results.push({
        path: pageInfo.path,
        name: pageInfo.name,
        status,
        title,
        redirectedToLogin,
        errors: consoleErrors,
        success: status < 400 && consoleErrors.length === 0
      });

      if (redirectedToLogin) {
        console.log(`  ✓ Redirected to login (expected for auth routes)`);
      } else if (status >= 400) {
        console.log(`  ✗ HTTP ${status} error`);
      } else if (consoleErrors.length > 0) {
        console.log(`  ⚠️ Console errors: ${consoleErrors.join(', ')}`);
      } else {
        console.log(`  ✓ Page loaded successfully`);
      }

    } catch (error) {
      console.log(`  ✗ Navigation failed: ${error.message}`);
      results.push({
        path: pageInfo.path,
        name: pageInfo.name,
        error: error.message,
        success: false
      });
    }

    console.log('');
  }

  // Test public pages
  console.log('🌐 Testing public pages...\n');
  const publicPages = [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
  ];

  for (const pageInfo of publicPages) {
    try {
      console.log(`📄 Testing: ${pageInfo.name} (${pageInfo.path})`);

      const response = await page.goto(`${baseUrl}${pageInfo.path}`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      const status = response.status();
      const title = await page.title();

      if (status < 400) {
        console.log(`  ✓ Page loaded successfully - ${title}`);
      } else {
        console.log(`  ✗ HTTP ${status} error`);
      }

    } catch (error) {
      console.log(`  ✗ Navigation failed: ${error.message}`);
    }
    console.log('');
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log('═══════════════════════════════════════');

  const successCount = results.filter(r => r.success).length;
  const authRedirectCount = results.filter(r => r.redirectedToLogin).length;

  console.log(`✅ Successful page loads: ${successCount}/${results.length}`);
  console.log(`🔐 Auth redirects (expected): ${authRedirectCount}`);

  const failedPages = results.filter(r => !r.success && !r.redirectedToLogin);
  if (failedPages.length > 0) {
    console.log(`\n❌ Failed pages:`);
    failedPages.forEach(p => {
      console.log(`  - ${p.name}: ${p.error || 'HTTP ' + p.status}`);
    });
  }

  await browser.close();

  // Return exit code based on results
  const hasErrors = failedPages.length > 0;
  process.exit(hasErrors ? 1 : 0);
}

// Run the test
testNavigation().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});