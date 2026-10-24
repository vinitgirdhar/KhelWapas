import { defineConfig } from '@playwright/test';
export default defineConfig({
  expect: { timeout: 15000 },
  testDir: './tests', testMatch: '**/*.spec.ts', fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: 'http://localhost:9003', trace: 'retain-on-failure' },
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: { command: 'npm run dev -- --port 9003', url: 'http://localhost:9003', reuseExistingServer: false, timeout: 180000, env: { APP_URL: 'http://localhost:9003', NEXT_DIST_DIR: '.next-test' } },
});
