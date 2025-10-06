import { BasePage } from './base-page';
import { SignInLocators } from '../locators/sign-in-locators';
import { CommonMethods } from '../../utils/common-browser-actions';
import { expect } from '../../utils/wrapped-expect';

export class SignInPage extends BasePage {
  pagePath: string = '/v2/auth';
  private commonMethods: CommonMethods = new CommonMethods(this.page);
  private locators: SignInLocators = new SignInLocators(this.page);

  async verifyElementsVisibility(): Promise<void> {
    const elements = [
      this.locators.emailInput,
      this.locators.passwordInput,
      this.locators.signInButton,
    ];

    for (const element of elements) {
      await expect(element).toBeVisible();
    }
  }

  async clickOnSignInButton() {
    await expect(this.locators.signInButton).toBeVisible();
    await this.locators.signInButton.click();
  }

  async signIn(email: string, password: string) {
    await this.locators.emailInput.fill(email);
    await this.locators.passwordInput.fill(password);
    await this.clickOnSignInButton();
  }
}
