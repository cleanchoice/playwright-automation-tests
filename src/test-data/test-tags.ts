// tags.ts
export const tags = {
  cce: '@CCE',
  esg: '@ESG',
  e2e: '@E2E',
  api: '@API',
  regression: '@REGRESSION',
  bug: '@BUG',
} as const;

export type TagKey = keyof typeof tags; // 'cce' | 'regression' | ... | 'esg'
export type Tag = (typeof tags)[TagKey]; // '@CCE' | '@REGRESSION' | ... | '@ESG'

export const pickTags = (...keys: TagKey[]): Tag[] => keys.map((k) => tags[k]);
