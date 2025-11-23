import { Page } from '@playwright/test';

export class SignUpLocators {
  constructor(protected page: Page) {}

  get firstNameInput() {
    return this.page.locator('input[name="firstName"]').describe('First Name Input');
  }

  get lastNameInput() {
    return this.page.locator('input[name="lastName"]').describe('Last Name Input');
  }

  get emailInput() {
    return this.page.locator('input[name="email"]').describe('Email Input');
  }

  get passwordInput() {
    return this.page.locator('input[name="password"]').describe('Password Input');
  }

  get confirmPasswordInput() {
    return this.page.locator('input[name="confirmPassword"]').describe('Confirm Password Input');
  }

  get createAccountButton() {
    return this.page.locator('button[type="submit"]:has-text("Create Account")').describe('Create Account Button');
  }
}
