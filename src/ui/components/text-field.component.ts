import { Locator, Page } from '@playwright/test';
import { expect } from '../../utils/wrapped-expect';

export class TextFieldComponent {
  constructor(private page: Page) {}

  // ---- base component locators ----
  private nameValue(name: TextFieldComponentNames): string {
    switch (name) {
      case TextFieldComponentNames.Email:
        return 'email';
      default:
        throw new Error(`Unknown Text field name: ${name as string}`);
    }
  }

  private rootSelector(name: TextFieldComponentNames): string {
    const dtName = this.nameValue(name);
    return `[datatestsubtype="textField"][datatestname="${dtName}"]`;
  }

  root(name: TextFieldComponentNames): Locator {
    return this.page.locator(this.rootSelector(name)).describe(`Text field root "${name}"`);
  }

  label(name: TextFieldComponentNames): Locator {
    return this.page.locator(`${this.rootSelector(name)} [datatestrole="label"]`).describe(`Text field label "${name}"`);
  }

  input(name: TextFieldComponentNames): Locator {
    const dtName = this.nameValue(name);
    return this.page.locator(`[datatestsubtype="textField"][datatestname="${dtName}"] [datatestrole="input"]`).describe(`Text Field input "${dtName}"`);
  }

  // ---- error locators ----
  private errorBase(name: TextFieldComponentNames): Locator {
    return this.page.locator(`${this.rootSelector(name)} [datatestrole="error"]`).describe(`Text field error "${name}"`);
  }

  private errorFilter(errorType: TextFieldErrors): RegExp {
    switch (errorType) {
      case TextFieldErrors.RequiredGeneric:
        return /\bPlease fill in this field to continue\b/i;
      default:
        return /.^/;
    }
  }

  // ---- get errors ----
  async stimulateRequiredError(name: TextFieldComponentNames) {
    const field = this.input(name);
    await field.click();
    await field.evaluate((el) => el.blur());
  }

  getError(name: TextFieldComponentNames, errorType: TextFieldErrors): Locator {
    const base = this.errorBase(name);
    return base.filter({ hasText: this.errorFilter(errorType) }).describe(`Text field error "${name}"`);
  }

  // ---- actions ----
  async fillTextField(name: TextFieldComponentNames, value: string) {
    const field = this.input(name);
    await field.fill(value);
    await field.evaluate((el) => el.blur());
  }

  // ---- expectations ----
  async expectInputVisible(name: TextFieldComponentNames): Promise<void> {
    await expect(this.input(name)).toBeVisible();
  }

  async expectInputEnabled(name: TextFieldComponentNames): Promise<void> {
    await expect(this.input(name)).toBeEnabled();
  }

  async expectInputPlaceholder(
    name: TextFieldComponentNames,
    placeholder: TextFieldComponentPlaceholders,
  ): Promise<void> {
    await expect(this.input(name)).toHaveAttribute('placeholder', placeholder);
  }

  async expectInputValue(name: TextFieldComponentNames, value: string): Promise<void> {
    await expect(this.input(name)).toHaveValue(value);
  }

  async expectLabel(name: TextFieldComponentNames, expected: TextFieldComponentLabels): Promise<void> {
    await expect(this.label(name)).toHaveText(expected, { useInnerText: true });
  }

  async expectError(name: TextFieldComponentNames, errorType: TextFieldErrors): Promise<void> {
    await expect(this.getError(name, errorType)).toBeVisible();
  }

  async expectNoError(name: TextFieldComponentNames): Promise<void> {
    await expect(this.errorBase(name)).toBeHidden();
  }
}

export enum TextFieldComponentNames {
  Email,
}

export enum TextFieldComponentLabels {
  Email = 'Email',
}

export enum TextFieldComponentPlaceholders {
  Email = 'Email',
}

export enum TextFieldErrors {
  RequiredGeneric = 'RequiredGeneric',
}
