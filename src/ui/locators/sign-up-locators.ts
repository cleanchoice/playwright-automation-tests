import { Page } from '@playwright/test';
import { makeLocator } from '../../utils/locator-maker';

export class SignUpLocators {
  constructor(protected page: Page) {}

  get firstNameInput() {
    return makeLocator(this.page, 'input[name="firstName"]', 'First Name Input');
  }

  get lastNameInput() {
    return makeLocator(this.page, 'input[name="lastName"]', 'Last Name Input');
  }

  get emailInput() {
    return makeLocator(this.page, 'input[name="email"]', 'Email Input');
  }

  get passwordInput() {
    return makeLocator(this.page, 'input[name="password"]', 'Password Input');
  }

  get confirmPasswordInput() {
    return makeLocator(this.page, 'input[name="confirmPassword"]', 'Confirm Password Input');
  }

  get createAccountButton() {
    return makeLocator(this.page, 'button[type="submit"]:has-text("Create Account")', 'Create Account Button');
  }
}
