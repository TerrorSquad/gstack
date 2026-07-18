import { defineConfig, devices } from '@playwright/test'

// Runs its own dev server on 3010 so it can coexist with `pnpm dev` on 3000.
// A single dev-mode Nuxt server can't safely serve parallel workers → workers: 1.
const PORT = 3010

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
