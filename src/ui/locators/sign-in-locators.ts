import { Page } from '@playwright/test';

export class SignInLocators {
  constructor(protected page: Page) {}

  get emailInput() {
    return this.page.locator('input[name="email"]').describe('Email Input');
  }

  get passwordInput() {
    return this.page.locator('input[name="password"]').describe('Password Input');
  }

  get signInButton() {
    return this.page.locator('button[type="submit"]:has-text("sign in"]').describe('Sign In Button');
  }
}
