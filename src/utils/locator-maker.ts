import { Page, FrameLocator, Locator } from '@playwright/test';
import { registerLocator } from './page-wraper';

type LocatorContext = Page | FrameLocator;

function parseHasTextRegex(selector: string): { base: string; regex: RegExp; nth?: number } | null {
  const match = selector.match(/^(.+):has-text\((\/.+\/[gimsuy]*)\)(?:\s*>>\s*nth=(\d+))?$/);
  if (!match) return null;

  const [, baseSelector, regexSource, nthStr] = match;
  try {
    const regexParts = regexSource.match(/^\/(.*)\/([gimsuy]*)$/);
    if (!regexParts) return null;

    const [, pattern, flags] = regexParts;
    const regex = new RegExp(pattern, flags);
    const nth = nthStr ? Number(nthStr) : undefined;
    return { base: baseSelector.trim(), regex, nth };
  } catch {
    return null;
  }
}

export function makeLocator(context: LocatorContext, selector: string, name: string): Locator {
  registerLocator(selector, name);

  const parsed = parseHasTextRegex(selector);
  if (parsed) {
    let loc = context.locator(parsed.base).filter({ hasText: parsed.regex });
    if (parsed.nth !== undefined) loc = loc.nth(parsed.nth);
    return loc;
  }

  return context.locator(selector);
}

export function makeLocatorWithFrame(page: Page, frameSelector: string, innerSelector: string, name: string): Locator {
  registerLocator(`${frameSelector} >> ${innerSelector}`, name);
  const frame = page.frameLocator(frameSelector);
  return frame.locator(innerSelector);
}
