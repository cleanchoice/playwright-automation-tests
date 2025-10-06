import { defineConfig, devices } from '@playwright/test';
import { ProjectConfig, projectsConfig } from './src/config/config';
import dotenv from 'dotenv';

dotenv.config();

const productKey = process.env.PROJECT as keyof typeof projectsConfig;
const projectEnvironments = projectsConfig[productKey];
if (!projectEnvironments) {
  throw new Error(`Project '${productKey}' not found in projectsConfig. Available projects: ${Object.keys(projectsConfig).join(', ')}`);
}
const envKey = process.env.ENVIRONMENT as keyof typeof projectEnvironments;
const platform = process.env.PLATFORM as 'desktop';
const name = `${productKey}-${envKey}-${platform}`;

const device = devices['Desktop Chrome'];
const viewport = { width: 1280, height: 720 };

const projectConfig: ProjectConfig = projectEnvironments[envKey];
process.env.BASE_URL = projectConfig.baseUrl;

export default defineConfig({
  globalSetup: process.env.CI ? require.resolve('./src/utils/global-setup.ts') : undefined,
  globalTeardown: process.env.CI ? require.resolve('./src/utils/global-teardown.ts') : undefined,
  testDir: './tests',
  timeout: 4 * 60 * 1000,
  expect: {
    timeout: 30000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html'],
        ['json', { outputFile: 'playwright-report/report.json' }],
      ]
    : [
        ['list'],
        ['html'],
        ['json', { outputFile: 'playwright-report/report.json' }],
      ],
  use: {
    actionTimeout: 55000,
    headless: true,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      slowMo: 300,
    },
  },
  outputDir: 'test-results/',
  projects: [
    {
      name,
      testDir: `./tests/${productKey}`,
      snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{text}',
      use: {
        ...device,
        viewport,
        baseURL: process.env.BASE_URL,
      },
      metadata: {
        productKey,
        envKey,
        platform,
      },
    },
  ],
});
