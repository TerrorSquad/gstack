import { test, expect } from '@playwright/test'

// Visual-regression baselines. NOT part of the normal suite — run via
// `pnpm screenshots` (or `pnpm screenshots:update` to regenerate). Runs as the
// seeded admin (storageState from the setup project). Baselines are Linux-only;
// generate them through scripts/screenshots-docker.sh so a non-Linux host still
// produces the PNGs CI diffs against.
const PAGES: Record<string, string> = {
  login: '/login',
  dashboard: '/dashboard',
  notes: '/notes',
  admin: '/admin',
  account: '/account',
  changelog: '/changelog',
}

for (const [name, path] of Object.entries(PAGES)) {
  test(`screenshot: ${name}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
  })
}
