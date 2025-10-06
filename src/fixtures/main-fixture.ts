import { APIRequestContext, test as baseTest } from '@playwright/test';
import { PageManager } from '../ui/page-manager';
import { ApiManager } from '../api/api-manager';

type CleanupCtx = { api: ApiManager; request: APIRequestContext };
type Cleanup = (ctx: CleanupCtx) => void | Promise<void>;

export const test = baseTest.extend<{
  anonUser: PageManager;
  api: ApiManager;
  addCleanup: (cb: Cleanup) => void;
}>({
  anonUser: async ({ page }, use) => {
    await use(new PageManager(page));
  },

  api: async ({ page }, use) => {
    await use(new ApiManager(page));
  },

  addCleanup: async ({ api, request }, use, testInfo) => {
    const cleanups: Cleanup[] = [];
    await use((cb: Cleanup) => cleanups.push(cb));

    const primaryErrors =
      (testInfo as any).errors?.map((e: any) => e.error ?? e) ?? (testInfo.error ? [testInfo.error] : []);
    const errors: unknown[] = [];
    if (primaryErrors?.length) errors.push(...primaryErrors);

    for (const cb of cleanups.reverse()) {
      try {
        await cb({ api, request });
      } catch (e) {
        errors.push(e);
      }
    }

    const extraCleanupErrors = errors.length > (primaryErrors?.length ?? 0);
    if (extraCleanupErrors) {
      if (errors.length === 1) throw errors[0];
      throw new AggregateError(errors, 'Multiple errors (test + cleanup) occurred');
    }
  },
});

export const expect = test.expect;
