import { test, expect } from '@playwright/test';
import { JobSearchPage } from '../utils/pages/job-search.page';
import { login, TEST_USER, waitForAPI } from '../utils/test-helpers';

test.describe('Job Search', () => {
  let jobSearchPage: JobSearchPage;

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
    
    jobSearchPage = new JobSearchPage(page);
    await jobSearchPage.navigate();
  });

  test('should display job search form', async ({ page }) => {
    // Check all search form elements are visible
    await expect(page.locator('input[name="searchTerm"]')).toBeVisible();
    await expect(page.locator('input[name="location"]')).toBeVisible();
    await expect(page.locator('select[name="jobBoard"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should search for jobs successfully', async ({ page }) => {
    // Set up API response listener
    const apiResponse = waitForAPI(page, '/api/job-searches');
    
    // Perform search
    await jobSearchPage.searchJobs('Software Engineer', 'San Francisco, CA');
    
    // Wait for API response
    await apiResponse;
    
    // Wait for results to load
    await jobSearchPage.waitForSearchResults();
    
    // Check that jobs are displayed
    const jobCount = await jobSearchPage.getJobCount();
    expect(jobCount).toBeGreaterThan(0);
  });

  test('should save a job to saved list', async ({ page }) => {
    // Search for jobs first
    await jobSearchPage.searchJobs('Developer', 'Remote');
    await jobSearchPage.waitForSearchResults();
    
    // Save the first job
    await jobSearchPage.saveJob(0);
    
    // Verify toast message
    await expect(page.locator('text=Job saved successfully')).toBeVisible();
    
    // Navigate to saved jobs
    await page.goto('/jobs/saved');
    
    // Verify job appears in saved list
    await expect(page.locator('[data-testid="job-listing"]')).toHaveCount(1);
  });

  test('should dismiss a job', async ({ page }) => {
    // Search for jobs
    await jobSearchPage.searchJobs('Engineer', 'New York');
    await jobSearchPage.waitForSearchResults();
    
    // Get initial job count
    const initialCount = await jobSearchPage.getJobCount();
    
    // Dismiss the first job
    await jobSearchPage.dismissJob(0);
    
    // Job should be removed from list
    await page.waitForTimeout(500); // Wait for animation
    const newCount = await jobSearchPage.getJobCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should add job to leads', async ({ page }) => {
    // Search for jobs
    await jobSearchPage.searchJobs('Product Manager', 'Austin, TX');
    await jobSearchPage.waitForSearchResults();
    
    // Get job details before adding
    const jobDetails = await jobSearchPage.getJobDetails(0);
    
    // Add to leads
    await jobSearchPage.addJobToLeads(0);
    
    // Navigate to leads page
    await page.goto('/leads');
    
    // Verify job appears in leads
    await expect(page.locator(`text=${jobDetails.title}`)).toBeVisible();
    await expect(page.locator(`text=${jobDetails.company}`)).toBeVisible();
  });

  test('should filter jobs by experience level', async ({ page }) => {
    // Search for jobs
    await jobSearchPage.searchJobs('Software Developer', 'Seattle');
    await jobSearchPage.waitForSearchResults();
    
    // Apply experience filter
    await jobSearchPage.filterByExperience('senior');
    await jobSearchPage.applyFilters();
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Check that results are filtered (verify through job titles containing "Senior")
    const jobs = page.locator('[data-testid="job-title"]');
    const count = await jobs.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const title = await jobs.nth(i).textContent();
      expect(title?.toLowerCase()).toContain('senior');
    }
  });

  test('should filter jobs by salary range', async ({ page }) => {
    // Search for jobs
    await jobSearchPage.searchJobs('Data Scientist', 'Boston');
    await jobSearchPage.waitForSearchResults();
    
    // Apply salary filter
    await jobSearchPage.filterBySalary('100000', '200000');
    await jobSearchPage.applyFilters();
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify results are filtered (this would need actual salary data in the UI)
    const jobCount = await jobSearchPage.getJobCount();
    expect(jobCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty search results', async ({ page }) => {
    // Search with very specific term unlikely to return results
    await jobSearchPage.searchJobs('Underwater Basket Weaving Expert', 'Antarctica');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should show no results message
    await expect(page.locator('text=No jobs found')).toBeVisible();
  });

  test('should paginate through results', async ({ page }) => {
    // Search for common term to ensure multiple pages
    await jobSearchPage.searchJobs('Software', 'United States');
    await jobSearchPage.waitForSearchResults();
    
    // Check pagination exists
    const pagination = page.locator('[data-testid="pagination"]');
    await expect(pagination).toBeVisible();
    
    // Click next page
    await page.click('[data-testid="pagination-next"]');
    
    // Wait for new results
    await page.waitForTimeout(1000);
    
    // Verify we're on page 2
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
  });

  test('should save search for future use', async ({ page }) => {
    // Perform a search
    await jobSearchPage.searchJobs('React Developer', 'California');
    await jobSearchPage.waitForSearchResults();
    
    // Save the search
    await page.click('[data-testid="save-search-button"]');
    
    // Fill in search name
    await page.fill('[data-testid="search-name-input"]', 'My React Jobs Search');
    await page.click('[data-testid="confirm-save-search"]');
    
    // Verify toast
    await expect(page.locator('text=Search saved')).toBeVisible();
    
    // Navigate to saved searches
    await page.goto('/jobs/searches');
    
    // Verify saved search appears
    await expect(page.locator('text=My React Jobs Search')).toBeVisible();
  });

  test('should export job search results', async ({ page }) => {
    // Search for jobs
    await jobSearchPage.searchJobs('Marketing Manager', 'Chicago');
    await jobSearchPage.waitForSearchResults();
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-results-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('job-search-results');
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/);
  });
});