import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class JobLeadsPage extends BasePage {
  private leadCards = '[data-testid="job-lead-card"]';
  private applyButton = '[data-testid="apply-button"]';
  private updateStatusButton = '[data-testid="update-status-button"]';
  private statusSelect = '[data-testid="status-select"]';
  private notesTextarea = '[data-testid="notes-textarea"]';
  private saveNotesButton = '[data-testid="save-notes-button"]';
  private deleteLeadButton = '[data-testid="delete-lead-button"]';
  private filterStatusButtons = '[data-testid^="filter-status-"]';
  private searchInput = '[data-testid="search-leads-input"]';

  async navigate() {
    await super.navigate('/leads');
  }

  async getLeadCount(): Promise<number> {
    const leads = this.page.locator(this.leadCards);
    return leads.count();
  }

  async applyToJob(index = 0) {
    const applyButtons = this.page.locator(this.applyButton);
    await applyButtons.nth(index).click();
  }

  async updateLeadStatus(index: number, status: string) {
    const lead = this.page.locator(this.leadCards).nth(index);
    await lead.locator(this.updateStatusButton).click();
    await lead.locator(this.statusSelect).selectOption(status);
    await this.waitForToast('Status updated');
  }

  async addNotes(index: number, notes: string) {
    const lead = this.page.locator(this.leadCards).nth(index);
    await lead.locator(this.notesTextarea).fill(notes);
    await lead.locator(this.saveNotesButton).click();
    await this.waitForToast('Notes saved');
  }

  async deleteLead(index: number) {
    const lead = this.page.locator(this.leadCards).nth(index);
    await lead.locator(this.deleteLeadButton).click();
    
    // Confirm deletion in dialog
    await this.page.click('[data-testid="confirm-delete-button"]');
    await this.waitForToast('Lead deleted');
  }

  async filterByStatus(status: string) {
    await this.clickElement(`[data-testid="filter-status-${status}"]`);
  }

  async searchLeads(searchTerm: string) {
    await this.fillInput(this.searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
  }

  async getLeadDetails(index = 0) {
    const lead = this.page.locator(this.leadCards).nth(index);
    return {
      title: await lead.locator('[data-testid="lead-title"]').textContent(),
      company: await lead.locator('[data-testid="lead-company"]').textContent(),
      status: await lead.locator('[data-testid="lead-status"]').textContent(),
      appliedDate: await lead.locator('[data-testid="lead-applied-date"]').textContent(),
    };
  }

  async clickLeadDetails(index = 0) {
    const lead = this.page.locator(this.leadCards).nth(index);
    await lead.click();
  }

  async exportLeads() {
    await this.clickElement('[data-testid="export-leads-button"]');
    
    // Wait for download
    const download = await this.page.waitForEvent('download');
    return download;
  }
}