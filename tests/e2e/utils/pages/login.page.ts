import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private emailInput = 'input[name="email"]';
  private passwordInput = 'input[name="password"]';
  private submitButton = 'button[type="submit"]';
  private errorMessage = '[data-testid="error-message"]';
  private signupLink = 'a[href="/signup"]';

  async navigate() {
    await super.navigate('/login');
  }

  async login(email: string, password: string) {
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
    await this.clickElement(this.submitButton);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return this.getText(this.errorMessage);
  }

  async clickSignupLink() {
    await this.clickElement(this.signupLink);
  }

  async isLoginFormVisible(): Promise<boolean> {
    return this.isVisible(this.emailInput);
  }

  async waitForLoginSuccess() {
    await this.page.waitForURL(/\/(dashboard|overview)/, { 
      timeout: 10000 
    });
  }
}