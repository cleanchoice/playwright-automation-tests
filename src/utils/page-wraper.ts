// utils/wrap-page.ts
import { Page, Locator, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const knownActions = {
  click: 'Click on',
  fill: 'Fill in',
  type: 'Type in',
  press: 'Press key',
  check: 'Check',
  uncheck: 'Uncheck',
  selectOption: 'Select option',
  hover: 'Hover over',
} as const;

export const locatorNames = new Map<string, string>();

export function registerLocator(selector: string, name: string) {
  locatorNames.set(selector, name);
}

export function getLocatorName(selector: string): string {
  return locatorNames.get(selector) ?? selector;
}

function cleanSelector(selector: string): string {
  return selector === 'body' ? 'outside the element' : selector;
}

export function createStepsLogger(testTitle: string, testFilePath: string) {
  const sanitizedFileName = testFilePath.replace(/[^\w]/g, '_');
  const sanitizedTitle = testTitle.replace(/[^\w]/g, '_');

  const logsDir = path.resolve('src/logs');
  fs.mkdirSync(logsDir, { recursive: true });

  const stepsLogPath = path.resolve(logsDir, `${sanitizedFileName}__${sanitizedTitle}.log`);
  fs.writeFileSync(stepsLogPath, '');

  const logStep = (step: string) => {
    fs.appendFileSync(stepsLogPath, `STEP: ${step}\n`);
  };

  return { logStep };
}

function enhanceLocator(locator: Locator, selector: string, logStep: (msg: string) => void): Locator {
  const registeredName = locatorNames.get(selector);
  const friendly = registeredName ?? cleanSelector(selector);

  for (const [method, label] of Object.entries(knownActions)) {
    const original = locator[method as keyof Locator] as any;

    if (typeof original === 'function') {
      (locator as any)[method] = async (...args: any[]) => {
        const msg = `${label} "${friendly}"${args[0] ? ` with "${args[0]}"` : ''}`;
        logStep(msg);
        return await test.step(msg, async () => original.apply(locator, args));
      };
    }
  }

  return locator;
}

export function wrapPageWithSmartSteps(page: Page): Page {
  const { title, file } = test.info();
  const { logStep } = createStepsLogger(title, file || 'unknown');

  const originalLocator = page.locator.bind(page);
  const originalGoto = page.goto.bind(page);

  const wrappedPage = Object.create(page);

  wrappedPage.locator = ((...args: Parameters<Page['locator']>): Locator => {
    const selector = args[0];
    const locator = originalLocator(...args);
    return enhanceLocator(locator, selector, logStep);
  }) as Page['locator'];

  wrappedPage.goto = async (...args: Parameters<Page['goto']>) => {
    const url = args[0];
    const msg = `Go to "${url}"`;
    logStep(msg);
    return await test.step(msg, async () => await originalGoto(...args));
  };

  return wrappedPage as Page;
}
