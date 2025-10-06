import { Page } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export abstract class BasePage {
  public abstract pagePath: string;

  constructor(protected page: Page) {}

  async open(path?: string): Promise<void> {
    const url = path ?? this.pagePath;
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
    await this.verifyElementsVisibility();
  }

  abstract verifyElementsVisibility(): Promise<void>;
}
