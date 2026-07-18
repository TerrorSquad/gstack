import { test } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'

// Runs as the seeded admin (storageState set at the project level). Scans the
// public marketing pages + core authenticated pages for WCAG violations.
const PAGES = ['/', '/pricing', '/terms', '/privacy', '/dashboard', '/notes', '/admin', '/account']

// Disabled because they fire only on Nuxt UI's dashboard chrome (which we don't
// own), not on app content:
//   region / landmark-unique — UDashboardNavbar's <h1> and the brand link sit
//     outside a landmark, and UNavigationMenu (inheritAttrs:false) renders an
//     unlabelled <nav>, so multiple instances can't be named apart.
// Everything the app controls (contrast, names, titles, lang, headings) stays on.
const DISABLED_RULES = ['region', 'landmark-unique']

// Passed as checkA11y's `axeOptions` option (the axe-core run config).
const axeRunOptions = {
  rules: Object.fromEntries(DISABLED_RULES.map((id) => [id, { enabled: false }])),
}

// Both themes: dark mode has its own contrast tokens (see main.css .dark).
for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    for (const path of PAGES) {
      test(`a11y: ${path}`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await injectAxe(page)
        await checkA11y(page, undefined, {
          detailedReport: true,
          detailedReportOptions: { html: true },
          axeOptions: axeRunOptions,
        })
      })
    }
  })
}
