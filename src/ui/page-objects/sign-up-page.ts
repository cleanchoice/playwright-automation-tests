import { expect } from '../../utils/wrapped-expect';
import { BasePage } from './base-page';
import { SignUpLocators } from '../locators/sign-up-locators';
import { CommonMethods } from '../../utils/common-browser-actions';

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class SignUpPage extends BasePage {
  pagePath: string = '/v2/auth/signup';
  private commonMethods: CommonMethods = new CommonMethods(this.page);
  private locators: SignUpLocators = new SignUpLocators(this.page);

  async verifyElementsVisibility(): Promise<void> {
    const elements = [
      this.locators.firstNameInput,
      this.locators.lastNameInput,
      this.locators.emailInput,
      this.locators.passwordInput,
      this.locators.confirmPasswordInput,
      this.locators.createAccountButton,
    ];

    for (const element of elements) {
      await expect(element).toBeVisible();
    }
  }

  async signUp(request: SignUpRequest) {
    await this.locators.firstNameInput.fill(request.firstName);
    await this.locators.lastNameInput.fill(request.lastName);
    await this.locators.emailInput.fill(request.email);
    await this.locators.passwordInput.fill(request.password);
    await this.locators.confirmPasswordInput.fill(request.confirmPassword);
    //await this.clickOnCreateAccountButton();
  }

  async clickOnCreateAccountButton() {
    await expect(this.locators.createAccountButton).toBeVisible();
    await this.locators.createAccountButton.click();
  }
}
