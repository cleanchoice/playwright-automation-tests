import { Page } from '@playwright/test';
import { makeLocator } from '../../utils/locator-maker';

export class SignInLocators {
  constructor(protected page: Page) {}

  get emailInput() {
    return makeLocator(this.page, 'input[name="email"]', 'Email Input');
  }

  get passwordInput() {
    return makeLocator(this.page, 'input[name="password"]', 'Password Input');
  }

  get signInButton() {
    return makeLocator(this.page, 'button[type="submit"]:has-text("sign in")', 'Sign In Button');
  }
}
