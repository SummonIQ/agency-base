import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class JobSearchPage extends BasePage {
  private searchInput = 'input[name="searchTerm"]';
  private locationInput = 'input[name="location"]';
  private jobBoardSelect = 'select[name="jobBoard"]';
  private searchButton = 'button[type="submit"]';
  private jobListings = '[data-testid="job-listing"]';
  private saveJobButton = '[data-testid="save-job-button"]';
  private dismissJobButton = '[data-testid="dismiss-job-button"]';
  private addToLeadsButton = '[data-testid="add-to-leads-button"]';
  private loadingSpinner = '[data-testid="loading-spinner"]';

  async navigate() {
    await super.navigate('/jobs/search');
  }

  async searchJobs(searchTerm: string, location: string, jobBoard = 'INDEED') {
    await this.fillInput(this.searchInput, searchTerm);
    await this.fillInput(this.locationInput, location);
    await this.selectOption(this.jobBoardSelect, jobBoard);
    await this.clickElement(this.searchButton);
  }

  async waitForSearchResults() {
    await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });
    await this.page.waitForSelector(this.jobListings, { state: 'visible' });
  }

  async getJobCount(): Promise<number> {
    const jobs = this.page.locator(this.jobListings);
    return jobs.count();
  }

  async saveJob(index = 0) {
    const saveButtons = this.page.locator(this.saveJobButton);
    await saveButtons.nth(index).click();
    await this.waitForToast('Job saved successfully');
  }

  async dismissJob(index = 0) {
    const dismissButtons = this.page.locator(this.dismissJobButton);
    await dismissButtons.nth(index).click();
    await this.waitForToast('Job dismissed');
  }

  async addJobToLeads(index = 0) {
    const addButtons = this.page.locator(this.addToLeadsButton);
    await addButtons.nth(index).click();
    await this.waitForToast('Job added to leads');
  }

  async getJobDetails(index = 0) {
    const job = this.page.locator(this.jobListings).nth(index);
    return {
      title: await job.locator('[data-testid="job-title"]').textContent(),
      company: await job.locator('[data-testid="job-company"]').textContent(),
      location: await job.locator('[data-testid="job-location"]').textContent(),
    };
  }

  async clickJobDetails(index = 0) {
    const job = this.page.locator(this.jobListings).nth(index);
    await job.click();
  }

  async filterByExperience(level: string) {
    await this.clickElement(`[data-testid="filter-experience-${level}"]`);
  }

  async filterBySalary(min: string, max: string) {
    await this.fillInput('[data-testid="filter-salary-min"]', min);
    await this.fillInput('[data-testid="filter-salary-max"]', max);
  }

  async applyFilters() {
    await this.clickElement('[data-testid="apply-filters-button"]');
  }

  async clearFilters() {
    await this.clickElement('[data-testid="clear-filters-button"]');
  }
}