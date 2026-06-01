# Playwright E2E Tests

This directory contains end-to-end tests for the Gimme Job application using Playwright.

## Setup

1. Install dependencies:
```bash
bun install
bun playwright:install
```

2. Set up environment variables:
```bash
cp .env.example .env.test
# Update the .env.test file with test values
```

3. Set up test database:
```bash
DATABASE_URL=your_test_db_url bun db:push
```

## Running Tests

### Run all tests
```bash
bun test:e2e
```

### Run tests in UI mode (recommended for development)
```bash
bun test:e2e:ui
```

### Run tests in debug mode
```bash
bun test:e2e:debug
```

### Run specific test file
```bash
bun playwright test tests/e2e/auth/login.spec.ts
```

### Run tests with specific tag
```bash
bun playwright test --grep @smoke
```

## Test Structure

```
tests/e2e/
├── auth/                 # Authentication tests
│   └── login.spec.ts    
├── jobs/                 # Job search tests
│   └── job-search.spec.ts
├── leads/                # Job lead management tests
│   └── job-leads.spec.ts
├── applications/         # Application submission tests
│   └── application-submission.spec.ts
├── resumes/              # Resume management tests
│   └── resume-management.spec.ts
├── utils/                # Test utilities and helpers
│   ├── test-helpers.ts   # Common helper functions
│   └── pages/            # Page Object Models
│       ├── base.page.ts
│       ├── login.page.ts
│       ├── job-search.page.ts
│       └── job-leads.page.ts
├── fixtures/             # Test data files
│   └── test-resume.md
└── setup/                # Global setup files
    └── global-setup.ts
```

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Using Page Objects
```typescript
import { LoginPage } from '../utils/pages/login.page';

test('login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('email@example.com', 'password');
});
```

### Common Helpers
```typescript
import { login, waitForAPI, uploadFile } from '../utils/test-helpers';

// Login helper
await login(page, 'test@example.com', 'password');

// Wait for API
await waitForAPI(page, '/api/jobs');

// Upload file
await uploadFile(page, 'input[type="file"]', 'test-resume.pdf');
```

## Best Practices

1. **Use data-testid attributes**: Add `data-testid` to elements for reliable selectors
2. **Page Object Model**: Use page objects for better test organization
3. **Wait for elements**: Always wait for elements before interacting
4. **Use meaningful test names**: Describe what the test does
5. **Clean up test data**: Reset state between tests
6. **Handle async properly**: Use proper async/await patterns
7. **Take screenshots on failure**: Configured automatically in playwright.config.ts

## Debugging

### Take screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Pause execution
```typescript
await page.pause();
```

### View browser console
```typescript
page.on('console', msg => console.log(msg.text()));
```

### Slow down execution
```typescript
test.use({ 
  launchOptions: { 
    slowMo: 500 // milliseconds 
  } 
});
```

## CI/CD

Tests run automatically on:
- Push to main/develop branches
- Pull requests

See `.github/workflows/playwright.yml` for configuration.

## Troubleshooting

### Tests timing out
- Increase timeout in playwright.config.ts
- Check network requests aren't hanging
- Ensure elements are actually visible

### Flaky tests
- Add proper waits for dynamic content
- Use `waitForLoadState('networkidle')`
- Check for race conditions

### Can't find elements
- Verify selectors with Playwright Inspector
- Check if element is in shadow DOM
- Ensure element is visible and not covered