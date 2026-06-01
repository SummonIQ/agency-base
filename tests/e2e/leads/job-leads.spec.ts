import { test, expect } from '@playwright/test';
import { JobLeadsPage } from '../utils/pages/job-leads.page';
import { JobSearchPage } from '../utils/pages/job-search.page';
import { login, TEST_USER } from '../utils/test-helpers';

test.describe('Job Leads Management', () => {
  let jobLeadsPage: JobLeadsPage;

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
    
    // Add a job to leads for testing
    const jobSearchPage = new JobSearchPage(page);
    await jobSearchPage.navigate();
    await jobSearchPage.searchJobs('Test Engineer', 'Remote');
    await jobSearchPage.waitForSearchResults();
    await jobSearchPage.addJobToLeads(0);
    
    // Navigate to leads page
    jobLeadsPage = new JobLeadsPage(page);
    await jobLeadsPage.navigate();
  });

  test('should display job leads list', async ({ page }) => {
    // Check that leads are displayed
    const leadCount = await jobLeadsPage.getLeadCount();
    expect(leadCount).toBeGreaterThan(0);
    
    // Check lead card elements
    await expect(page.locator('[data-testid="job-lead-card"]').first()).toBeVisible();
  });

  test('should update lead status', async ({ page }) => {
    // Update status to "Applied"
    await jobLeadsPage.updateLeadStatus(0, 'APPLIED');
    
    // Verify status is updated in UI
    const leadDetails = await jobLeadsPage.getLeadDetails(0);
    expect(leadDetails.status).toContain('Applied');
  });

  test('should add notes to a lead', async ({ page }) => {
    const testNotes = 'Had a great phone screening. Next step is technical interview.';
    
    // Add notes
    await jobLeadsPage.addNotes(0, testNotes);
    
    // Reload page to verify persistence
    await page.reload();
    
    // Check notes are saved
    const notesTextarea = page.locator('[data-testid="notes-textarea"]').first();
    await expect(notesTextarea).toHaveValue(testNotes);
  });

  test('should filter leads by status', async ({ page }) => {
    // First, set up leads with different statuses
    await jobLeadsPage.updateLeadStatus(0, 'APPLIED');
    
    // Add another lead
    const jobSearchPage = new JobSearchPage(page);
    await jobSearchPage.navigate();
    await jobSearchPage.searchJobs('Product Manager', 'New York');
    await jobSearchPage.waitForSearchResults();
    await jobSearchPage.addJobToLeads(0);
    
    await jobLeadsPage.navigate();
    
    // Filter by "Applied" status
    await jobLeadsPage.filterByStatus('APPLIED');
    
    // Verify only applied leads are shown
    const leadCount = await jobLeadsPage.getLeadCount();
    expect(leadCount).toBe(1);
    
    const leadDetails = await jobLeadsPage.getLeadDetails(0);
    expect(leadDetails.status).toContain('Applied');
  });

  test('should search leads by keyword', async ({ page }) => {
    // Get the first lead's title
    const leadDetails = await jobLeadsPage.getLeadDetails(0);
    const searchTerm = leadDetails.title?.split(' ')[0] || 'Test';
    
    // Search for the lead
    await jobLeadsPage.searchLeads(searchTerm);
    
    // Verify search results
    await page.waitForTimeout(500);
    const leadCount = await jobLeadsPage.getLeadCount();
    expect(leadCount).toBeGreaterThan(0);
    
    // Verify the found lead contains search term
    const foundLeadDetails = await jobLeadsPage.getLeadDetails(0);
    expect(foundLeadDetails.title?.toLowerCase()).toContain(searchTerm.toLowerCase());
  });

  test('should navigate to lead details page', async ({ page }) => {
    // Click on a lead
    await jobLeadsPage.clickLeadDetails(0);
    
    // Verify navigation to details page
    await expect(page).toHaveURL(/\/leads\/[a-zA-Z0-9]+$/);
    
    // Verify details page elements
    await expect(page.locator('[data-testid="lead-details-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="lead-details-company"]')).toBeVisible();
    await expect(page.locator('[data-testid="lead-details-description"]')).toBeVisible();
  });

  test('should delete a lead', async ({ page }) => {
    // Get initial count
    const initialCount = await jobLeadsPage.getLeadCount();
    
    // Delete the first lead
    await jobLeadsPage.deleteLead(0);
    
    // Verify lead is removed
    await page.waitForTimeout(500);
    const newCount = await jobLeadsPage.getLeadCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should track application timeline', async ({ page }) => {
    // Update lead through different statuses
    await jobLeadsPage.updateLeadStatus(0, 'APPLIED');
    await page.waitForTimeout(500);
    
    await jobLeadsPage.updateLeadStatus(0, 'INTERVIEW_SCHEDULED');
    await page.waitForTimeout(500);
    
    // Click on lead to view details
    await jobLeadsPage.clickLeadDetails(0);
    
    // Check timeline is displayed
    await expect(page.locator('[data-testid="application-timeline"]')).toBeVisible();
    
    // Verify timeline entries
    await expect(page.locator('text=Status changed to Applied')).toBeVisible();
    await expect(page.locator('text=Status changed to Interview Scheduled')).toBeVisible();
  });

  test('should bulk update lead statuses', async ({ page }) => {
    // Add multiple leads first
    const jobSearchPage = new JobSearchPage(page);
    for (let i = 0; i < 3; i++) {
      await jobSearchPage.navigate();
      await jobSearchPage.searchJobs(`Engineer ${i}`, 'Remote');
      await jobSearchPage.waitForSearchResults();
      await jobSearchPage.addJobToLeads(0);
    }
    
    await jobLeadsPage.navigate();
    
    // Select multiple leads
    await page.check('[data-testid="select-lead-checkbox"]:nth-of-type(1)');
    await page.check('[data-testid="select-lead-checkbox"]:nth-of-type(2)');
    
    // Bulk update status
    await page.click('[data-testid="bulk-actions-button"]');
    await page.click('[data-testid="bulk-update-status"]');
    await page.selectOption('[data-testid="bulk-status-select"]', 'APPLIED');
    await page.click('[data-testid="confirm-bulk-update"]');
    
    // Verify all selected leads are updated
    await page.waitForTimeout(1000);
    const lead1 = await jobLeadsPage.getLeadDetails(0);
    const lead2 = await jobLeadsPage.getLeadDetails(1);
    
    expect(lead1.status).toContain('Applied');
    expect(lead2.status).toContain('Applied');
  });

  test('should export leads data', async ({ page }) => {
    // Test export functionality
    const download = await jobLeadsPage.exportLeads();
    
    // Verify download
    expect(download.suggestedFilename()).toContain('job-leads');
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/);
  });

  test('should show lead statistics', async ({ page }) => {
    // Check statistics section
    await expect(page.locator('[data-testid="leads-statistics"]')).toBeVisible();
    
    // Verify statistics are displayed
    await expect(page.locator('[data-testid="total-leads-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="applied-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="interview-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="offer-count"]')).toBeVisible();
  });
});