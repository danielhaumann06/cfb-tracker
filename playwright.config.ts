import { defineConfig, devices } from '@playwright/test'

// With BASE_URL set (e.g. the production URL after a deploy) the tests run
// against that site; otherwise they start the local production build.
const baseURL = process.env.BASE_URL ?? 'http://localhost:3411'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  // Pages fetch live ESPN data, so allow a retry for upstream hiccups.
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...devices['iPhone 13'],
    browserName: 'chromium',
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run start -- -p 3411',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
