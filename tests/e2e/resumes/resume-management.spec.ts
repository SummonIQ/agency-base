import { test, expect } from '@playwright/test';
import { login, createMockResume, uploadFile } from '../utils/test-helpers';
import path from 'path';

test.describe('Resume Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to resumes
    await login(page);
    await page.goto('/profile/resumes');
  });

  test('should display resume management page', async ({ page }) => {
    // Check page elements
    await expect(page.locator('h1:has-text("My Resumes")')).toBeVisible();
    await expect(page.locator('[data-testid="add-resume-button"]')).toBeVisible();
  });

  test('should create a new resume', async ({ page }) => {
    const mockResume = createMockResume();
    
    // Click add resume
    await page.click('[data-testid="add-resume-button"]');
    
    // Fill resume form
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    
    // Save resume
    await page.click('[data-testid="save-resume-button"]');
    
    // Verify success
    await expect(page.locator('text=Resume created successfully')).toBeVisible();
    
    // Verify resume appears in list
    await expect(page.locator(`text=${mockResume.name}`)).toBeVisible();
  });

  test('should upload a resume file', async ({ page }) => {
    // Click upload button
    await page.click('[data-testid="upload-resume-button"]');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-resume.pdf'));
    
    // Wait for processing
    await page.waitForSelector('text=Resume uploaded successfully');
    
    // Verify resume is processed and appears
    await expect(page.locator('[data-testid="resume-card"]')).toHaveCount(1);
  });

  test('should edit an existing resume', async ({ page }) => {
    // Create a resume first
    const mockResume = createMockResume();
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Click edit on the resume
    await page.click('[data-testid="edit-resume-button"]');
    
    // Update content
    const updatedContent = mockResume.content + '\n\n### Additional Skills\n- Docker, Kubernetes';
    await page.fill('[data-testid="resume-content-textarea"]', updatedContent);
    
    // Save changes
    await page.click('[data-testid="save-resume-button"]');
    
    // Verify update
    await expect(page.locator('text=Resume updated successfully')).toBeVisible();
  });

  test('should analyze resume with ATS score', async ({ page }) => {
    // Create a resume
    const mockResume = createMockResume();
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Click analyze button
    await page.click('[data-testid="analyze-resume-button"]');
    
    // Wait for analysis
    await page.waitForSelector('[data-testid="ats-score"]', { timeout: 30000 });
    
    // Check results
    await expect(page.locator('[data-testid="ats-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="resume-improvements"]')).toBeVisible();
    
    // Score should be a number between 0-100
    const scoreText = await page.locator('[data-testid="ats-score"]').textContent();
    const score = parseInt(scoreText || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should optimize resume for a job', async ({ page }) => {
    // Create a resume
    const mockResume = createMockResume();
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Click optimize button
    await page.click('[data-testid="optimize-resume-button"]');
    
    // Paste job description
    await page.fill('[data-testid="job-description-textarea"]', `
      Senior React Developer
      Requirements:
      - 5+ years React experience
      - TypeScript expertise
      - GraphQL knowledge
      - Team leadership experience
    `);
    
    // Start optimization
    await page.click('[data-testid="start-optimization-button"]');
    
    // Wait for optimization
    await page.waitForSelector('[data-testid="optimization-complete"]', { timeout: 30000 });
    
    // Check suggestions
    await expect(page.locator('[data-testid="optimization-suggestions"]')).toBeVisible();
    await expect(page.locator('[data-testid="keyword-matches"]')).toBeVisible();
    
    // Apply suggestions
    await page.click('[data-testid="apply-suggestions-button"]');
    
    // Verify resume updated
    await expect(page.locator('text=Resume optimized successfully')).toBeVisible();
  });

  test('should delete a resume', async ({ page }) => {
    // Create a resume to delete
    const mockResume = createMockResume({ name: 'Resume to Delete' });
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Click delete button
    await page.click('[data-testid="delete-resume-button"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify deletion
    await expect(page.locator('text=Resume deleted successfully')).toBeVisible();
    await expect(page.locator(`text=${mockResume.name}`)).not.toBeVisible();
  });

  test('should duplicate a resume', async ({ page }) => {
    // Create original resume
    const mockResume = createMockResume({ name: 'Original Resume' });
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Click duplicate button
    await page.click('[data-testid="duplicate-resume-button"]');
    
    // Verify duplicate created
    await expect(page.locator('text=Resume duplicated successfully')).toBeVisible();
    await expect(page.locator('text=Original Resume (Copy)')).toBeVisible();
  });

  test('should preview resume', async ({ page }) => {
    // Create a resume
    const mockResume = createMockResume();
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Click preview button
    await page.click('[data-testid="preview-resume-button"]');
    
    // Check preview modal
    await expect(page.locator('[data-testid="resume-preview-modal"]')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Software Engineer')).toBeVisible();
  });

  test('should export resume as PDF', async ({ page }) => {
    // Create a resume
    const mockResume = createMockResume();
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-resume-pdf"]');
    
    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should compare resume versions', async ({ page }) => {
    // Create a resume
    const mockResume = createMockResume();
    await page.click('[data-testid="add-resume-button"]');
    await page.fill('[data-testid="resume-name-input"]', mockResume.name);
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content);
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Edit to create a new version
    await page.click('[data-testid="edit-resume-button"]');
    await page.fill('[data-testid="resume-content-textarea"]', mockResume.content + '\n\n### New Section');
    await page.click('[data-testid="save-resume-button"]');
    await page.waitForTimeout(1000);
    
    // Open version history
    await page.click('[data-testid="view-versions-button"]');
    
    // Select versions to compare
    await page.check('[data-testid="version-checkbox-1"]');
    await page.check('[data-testid="version-checkbox-2"]');
    await page.click('[data-testid="compare-versions-button"]');
    
    // Check diff view
    await expect(page.locator('[data-testid="version-diff-view"]')).toBeVisible();
    await expect(page.locator('.diff-added')).toContainText('New Section');
  });

  test('should set default resume', async ({ page }) => {
    // Create multiple resumes
    for (let i = 1; i <= 2; i++) {
      await page.click('[data-testid="add-resume-button"]');
      await page.fill('[data-testid="resume-name-input"]', `Resume ${i}`);
      await page.fill('[data-testid="resume-content-textarea"]', createMockResume().content);
      await page.click('[data-testid="save-resume-button"]');
      await page.waitForTimeout(1000);
    }
    
    // Set the second resume as default
    const resumeCards = page.locator('[data-testid="resume-card"]');
    await resumeCards.nth(1).locator('[data-testid="set-default-button"]').click();
    
    // Verify default indicator
    await expect(resumeCards.nth(1).locator('[data-testid="default-badge"]')).toBeVisible();
  });
});