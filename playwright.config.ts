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
      // Authenticated feature flows using the saved admin (Acme) session.
      name: 'app',
      testMatch: /(feedback|notes)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth.json' },
      dependencies: ['setup'],
    },
    {
      // Tenant isolation logs in as a *different* tenant (Globex) itself, so it
      // runs with no saved session (a saved one would redirect /login away).
      name: 'isolation',
      testMatch: /tenant-isolation\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // README/design screenshots into docs/screenshots/. Opt-in via `pnpm
    // screenshots` (sets SCREENSHOTS) so a bare `pnpm test:e2e` never
    // regenerates PNGs and dirties the working tree.
    ...(process.env.SCREENSHOTS
      ? [
          {
            name: 'screenshots',
            testMatch: /screenshots\.spec\.ts/,
            // 1080p, not Desktop Chrome's 1280x720 — a README screenshot is read
            // at the size people actually run the app, and 720p crops the right
            // third off every wide layout.
            use: {
              ...devices['Desktop Chrome'],
              viewport: { width: 1920, height: 1080 },
              storageState: 'e2e/.auth.json',
            },
            dependencies: ['setup'],
          },
        ]
      : []),
  ],
  webServer: {
    // Screenshots always run against the production build, never `nuxt dev`: dev
    // floats the devtools badge over the page (it lands mid-shot and ends up in
    // the README) and serves unoptimised assets, so the captures wouldn't match
    // what a user actually sees. `pnpm screenshots` builds first.
    command:
      process.env.CI || process.env.SCREENSHOTS
        ? 'node .output/server/index.mjs'
        : 'pnpm dev --port 3010',
    // Dev compiles routes on first hit; warm /login to pre-compile the heaviest.
    url: 'http://localhost:3010/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Enable feedback so the widget + admin page render in the app project.
    env: { NUXT_IGNORE_LOCK: '1', PORT: '3010', NITRO_PORT: '3010', NUXT_PUBLIC_FEEDBACK_ENABLED: 'true' },
  },
})
