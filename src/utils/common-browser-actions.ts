import { expect, Locator, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export class CommonMethods {

  constructor(private page: Page) {}

  async setTokenIntolLocalStorage(token: string) {
    await this.page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, token);
  }

  async getTokenFromLocalStorage() {
    const authToken: string | null = await this.page.evaluate(() => localStorage.getItem('token'));
    return authToken;
  }

  async downloadFile(
    trigger: Locator,
    { fileName, timeout = 60_000, preClickDelayMs, dir = 'tests/downloads' }: DownloadFileOptions,
  ) {
    const path = `${dir}/${fileName}`;

    await expect(trigger).toBeVisible({ timeout: 10_000 });
    await trigger.scrollIntoViewIfNeeded();

    try {
      const waitDownload = this.page.waitForEvent('download', { timeout });
      if (preClickDelayMs && preClickDelayMs > 0) {
        await this.page.waitForTimeout(preClickDelayMs);
      }
      await trigger.click();
      const download = await waitDownload;
      await download.saveAs(path);

      expect(fs.existsSync(path)).toBeTruthy();
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('❌ Download did not happen in time.');
      }
      throw error;
    }
  }

  deleteDownloadedFileByName(fileName: string) {
    const authDir = 'tests/downloads';
    const filePath = path.join(authDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.log('File not found');
    }
  }

  async clearFieldViaBackspace(times: number) {
    for (let i = 0; i < times; i++) {
      await this.page.keyboard.press('Backspace');
    }
  }

  async getTodaysDayOfMonth(): Promise<string> {
    const today = new Date();
    return String(today.getDate());
  }

  async parseTextFromLocator(locator: Locator): Promise<string[]> {
    await expect(locator).toBeVisible();

    const elements = await locator.allInnerTexts();

    return elements
      .flatMap((text) => text.split('\n'))
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter((line) => line && /[^\s]/.test(line));
  }

  async expectLocatorTextToContainAll(locator: Locator, expectedValues: string[] | Record<string, any>): Promise<void> {
    const values = Array.isArray(expectedValues) ? expectedValues : Object.values(expectedValues);
    const text = await this.parseTextFromLocator(locator);
    for (const v of values) {
      expect(text).toContain(String(v));
    }
  }

  async waitForElementToDisappear(locator: Locator, timeout = 30000): Promise<void> {
    await expect
      .poll(
        async () => {
          const elements = await locator.all();
          console.log(elements.length);
          return elements.length === 0;
        },
        {
          timeout,
          intervals: [1000],
          message: `Wait for element to disappear: ${locator}`,
        },
      )
      .toBe(true);
  }
}

interface DownloadFileOptions {
  fileName: string;
  timeout?: number;
  preClickDelayMs?: number;
  dir?: string;
}
