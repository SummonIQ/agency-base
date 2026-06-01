import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  async clickElement(selector: string) {
    await this.page.click(selector);
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  async getText(selector: string): Promise<string> {
    return this.page.textContent(selector) || '';
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.page.isVisible(selector);
  }

  async waitForToast(message?: string) {
    const toastSelector = message 
      ? `[data-testid="toast"]:has-text("${message}")`
      : '[data-testid="toast"]';
    
    await this.page.waitForSelector(toastSelector, { state: 'visible' });
  }

  async dismissToast() {
    const toast = this.page.locator('[data-testid="toast"]');
    if (await toast.isVisible()) {
      await toast.click();
    }
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}