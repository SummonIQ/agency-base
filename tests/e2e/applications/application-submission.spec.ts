import { test, expect } from '@playwright/test';
import { JobLeadsPage } from '../utils/pages/job-leads.page';
import { login, uploadFile, createMockResume } from '../utils/test-helpers';
import path from 'path';

test.describe('Application Submission', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to leads
    await login(page);
    
    // Create a resume first
    await page.goto('/profile/resumes');
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', 'Test Resume');
    await page.fill('[data-testid="resume-content-textarea"]', createMockResume().content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Add a job lead
    await page.goto('/jobs/search');
    await page.fill('input[name="searchTerm"]', 'Software Engineer');
    await page.fill('input[name="location"]', 'San Francisco');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="job-listing"]');
    await page.click('[data-testid="add-to-leads-button"]');
    
    // Navigate to lead details
    await page.goto('/leads');
    await page.click('[data-testid="job-lead-card"]');
  });

  test('should display application form', async ({ page }) => {
    // Click apply button
    await page.click('[data-testid="apply-to-job-button"]');
    
    // Check form elements
    await expect(page.locator('[data-testid="application-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-resume"]')).toBeVisible();
    await expect(page.locator('[data-testid="cover-letter-option"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-application-button"]')).toBeVisible();
  });

  test('should submit application with resume only', async ({ page }) => {
    // Click apply
    await page.click('[data-testid="apply-to-job-button"]');
    
    // Select resume
    await page.selectOption('[data-testid="select-resume"]', { index: 1 });
    
    // Submit application
    await page.click('[data-testid="submit-application-button"]');
    
    // Wait for submission
    await page.waitForSelector('text=Application submitted successfully');
    
    // Verify status updated
    await expect(page.locator('[data-testid="lead-status"]')).toContainText('Applied');
  });

  test('should submit application with cover letter', async ({ page }) => {
    // Click apply
    await page.click('[data-testid="apply-to-job-button"]');
    
    // Select resume
    await page.selectOption('[data-testid="select-resume"]', { index: 1 });
    
    // Add cover letter
    await page.click('[data-testid="add-cover-letter-checkbox"]');
    await page.fill('[data-testid="cover-letter-content"]', `
Dear Hiring Manager,

I am excited to apply for this position...

Best regards,
Test User
    `);
    
    // Submit application
    await page.click('[data-testid="submit-application-button"]');
    
    // Verify submission
    await expect(page.locator('text=Application submitted successfully')).toBeVisible();
  });

  test('should auto-fill application forms', async ({ page }) => {
    // Navigate to Indeed application (mock)
    await page.click('[data-testid="apply-on-indeed-button"]');
    
    // Wait for auto-fill to complete
    await page.waitForTimeout(2000);
    
    // Verify form fields are filled
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Test');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('User');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });

  test('should track application status', async ({ page }) => {
    // Submit application first
    await page.click('[data-testid="apply-to-job-button"]');
    await page.selectOption('[data-testid="select-resume"]', { index: 1 });
    await page.click('[data-testid="submit-application-button"]');
    await page.waitForSelector('text=Application submitted successfully');
    
    // Check application tracking
    await expect(page.locator('[data-testid="application-status"]')).toContainText('Submitted');
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    
    // Update application status
    await page.click('[data-testid="update-application-status"]');
    await page.selectOption('[data-testid="status-select"]', 'VIEWED');
    
    // Verify update
    await expect(page.locator('[data-testid="application-status"]')).toContainText('Viewed');
  });

  test('should handle application errors gracefully', async ({ page }) => {
    // Click apply
    await page.click('[data-testid="apply-to-job-button"]');
    
    // Try to submit without selecting resume
    await page.click('[data-testid="submit-application-button"]');
    
    // Should show error
    await expect(page.locator('text=Please select a resume')).toBeVisible();
  });

  test('should save draft application', async ({ page }) => {
    // Start application
    await page.click('[data-testid="apply-to-job-button"]');
    await page.selectOption('[data-testid="select-resume"]', { index: 1 });
    
    // Add some custom answers
    await page.fill('[data-testid="years-experience-input"]', '5');
    await page.fill('[data-testid="salary-expectation-input"]', '150000');
    
    // Save draft
    await page.click('[data-testid="save-draft-button"]');
    await expect(page.locator('text=Draft saved')).toBeVisible();
    
    // Close and reopen
    await page.click('[data-testid="close-modal-button"]');
    await page.click('[data-testid="apply-to-job-button"]');
    
    // Verify draft is loaded
    await expect(page.locator('[data-testid="years-experience-input"]')).toHaveValue('5');
    await expect(page.locator('[data-testid="salary-expectation-input"]')).toHaveValue('150000');
  });

  test('should schedule follow-up reminders', async ({ page }) => {
    // Submit application
    await page.click('[data-testid="apply-to-job-button"]');
    await page.selectOption('[data-testid="select-resume"]', { index: 1 });
    await page.click('[data-testid="submit-application-button"]');
    await page.waitForSelector('text=Application submitted successfully');
    
    // Schedule follow-up
    await page.click('[data-testid="schedule-followup-button"]');
    
    // Set follow-up date (7 days from now)
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 7);
    await page.fill('[data-testid="followup-date-input"]', followUpDate.toISOString().split('T')[0]);
    
    // Add note
    await page.fill('[data-testid="followup-note-input"]', 'Send follow-up email if no response');
    
    // Save reminder
    await page.click('[data-testid="save-followup-button"]');
    
    // Verify reminder is set
    await expect(page.locator('text=Follow-up scheduled')).toBeVisible();
    await expect(page.locator('[data-testid="followup-indicator"]')).toBeVisible();
  });

  test('should handle batch applications', async ({ page }) => {
    // Go to leads page
    await page.goto('/leads');
    
    // Select multiple leads
    await page.check('[data-testid="select-lead-checkbox"]:nth-of-type(1)');
    
    // Add more leads if needed
    for (let i = 0; i < 2; i++) {
      await page.goto('/jobs/search');
      await page.fill('input[name="searchTerm"]', `Developer ${i}`);
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="job-listing"]');
      await page.click('[data-testid="add-to-leads-button"]');
    }
    
    await page.goto('/leads');
    await page.check('[data-testid="select-all-checkbox"]');
    
    // Click batch apply
    await page.click('[data-testid="bulk-actions-button"]');
    await page.click('[data-testid="bulk-apply-button"]');
    
    // Select resume for all
    await page.selectOption('[data-testid="bulk-select-resume"]', { index: 1 });
    
    // Submit batch applications
    await page.click('[data-testid="submit-batch-applications"]');
    
    // Wait for completion
    await page.waitForSelector('[data-testid="batch-progress-complete"]');
    
    // Verify all are applied
    const statusElements = page.locator('[data-testid="lead-status"]');
    const count = await statusElements.count();
    
    for (let i = 0; i < count; i++) {
      await expect(statusElements.nth(i)).toContainText('Applied');
    }
  });

  test('should export application history', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/leads/applied');
    
    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-applications-button"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('applications');
  });
});