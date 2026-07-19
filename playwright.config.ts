import { defineConfig, devices } from '@playwright/test'

// e2e runs against a seeded local Supabase. Locally it starts `nuxt dev` on
// 3010 (so it coexists with `pnpm dev` on 3000); CI serves the production build.
export default defineConfig({
  testDir: './e2e',
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:3010',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    {
      // Public smoke — no saved session.
      name: 'chromium',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'a11y',
      testMatch: /a11y\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth.json' },
      dependencies: ['setup'],
    },
    {
      // Authenticated feature flows (feedback submit → admin list).
      name: 'app',
      testMatch: /feedback\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: process.env.CI ? 'node .output/server/index.mjs' : 'pnpm dev --port 3010',
    // Dev compiles routes on first hit; warm /login to pre-compile the heaviest.
    url: 'http://localhost:3010/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Enable feedback so the widget + admin page render in the app project.
    env: { NUXT_IGNORE_LOCK: '1', PORT: '3010', NITRO_PORT: '3010', NUXT_PUBLIC_FEEDBACK_ENABLED: 'true' },
  },
})
