import { expect as baseExpect, test, Locator } from '@playwright/test';
import { getLocatorName } from './page-wraper';
import fs from 'fs';
import path from 'path';

const knownAssertions = {
  toBeVisible: 'Expect visible',
  toBeHidden: 'Expect hidden',
  toBeEnabled: 'Expect enabled',
  toBeDisabled: 'Expect disabled',
} as const;

function getLogFilePath() {
  const { title, file } = test.info();
  const sanitizedFileName = file?.replace(/[^\w]/g, '_') ?? 'unknown';
  const sanitizedTitle = title.replace(/[^\w]/g, '_');
  const logsDir = path.resolve('src/logs');
  fs.mkdirSync(logsDir, { recursive: true });
  return path.resolve(logsDir, `${sanitizedFileName}__${sanitizedTitle}.log`);
}

function logStep(message: string) {
  const logFile = getLogFilePath();
  fs.appendFileSync(logFile, `STEP: ${message}\n`);
}

export const expect: typeof baseExpect = new Proxy(baseExpect, {
  apply(target, thisArg, args: [actual: unknown]) {
    const [actual] = args;

    if (actual && typeof actual === 'object' && '_selector' in actual) {
      const assertions = target(actual as unknown as Locator);

      return new Proxy(assertions, {
        get(target, prop, receiver) {
          const assertionFn = Reflect.get(target, prop, receiver);

          if (typeof assertionFn === 'function' && prop in knownAssertions) {
            return async (...args: any[]) => {
              const selector = (actual as any)._selector ?? 'unknown';
              const name = getLocatorName(selector);
              const label = knownAssertions[prop as keyof typeof knownAssertions];
              const msg = `${label}: "${name}"`;

              logStep(msg);
              try {
                return await test.step(msg, () => assertionFn.apply(target, args));
              } catch (err) {
                throw new Error(`❌ STEP FAILED: ${msg}`);
              }
            };
          }

          return assertionFn;
        },
      });
    }

    return Reflect.apply(target, thisArg, args);
  },
});
