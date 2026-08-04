import { devices, test } from '@playwright/test'

// Captures every route in both themes into docs/screenshots/ — not a
// visual-regression baseline (no pixel diffing), just PNGs for the README and
// for eyeballing colors, fonts, borders and density against DESIGN.md.
//
// Run: `pnpm screenshots`. Reuses the seeded admin (Acme) session + local
// Supabase like the other authenticated projects.

/** Signed-in surface. The seeded admin can see the admin + feedback pages. */
const ROUTES = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'notes', path: '/notes' },
  { name: 'notes-new', path: '/notes/new' },
  { name: 'admin', path: '/admin' },
  { name: 'account', path: '/account' },
  { name: 'billing', path: '/billing' },
  { name: 'feedback', path: '/feedback/admin' },
  // Public chrome, same for everyone — the signed-in session is fine here.
  { name: 'pricing', path: '/pricing' },
  { name: 'changelog', path: '/changelog' },
  { name: 'roadmap', path: '/roadmap' },
  { name: 'privacy', path: '/privacy' },
  { name: 'terms', path: '/terms' },
] as const

/** Auth pages + landing, which redirect (or change) when a session exists. */
const LOGGED_OUT_ROUTES = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
] as const

const THEMES = ['light', 'dark'] as const

const OUT = 'docs/screenshots'

/** Let fonts and any enter animation settle before the shot. */
async function settle(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(350)
}

/**
 * colorScheme drives prefers-color-scheme, which is what the app follows by
 * default (same mechanism the a11y project uses). The localStorage write covers
 * the case where a preference was already persisted and would otherwise win.
 */
function forceTheme(page: import('@playwright/test').Page, theme: string) {
  return page.addInitScript((value) => {
    try {
      localStorage.setItem('nuxt-color-mode', value)
    } catch {
      // storage blocked — colorScheme still nudges prefers-color-scheme
    }
  }, theme)
}

for (const theme of THEMES) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    test.beforeEach(async ({ page }) => forceTheme(page, theme))

    for (const route of ROUTES) {
      test(`${route.name} · ${theme}`, async ({ page }) => {
        await page.goto(route.path)
        await settle(page)
        await page.screenshot({ path: `${OUT}/${route.name}-${theme}.png`, fullPage: true })
      })
    }
  })

  for (const route of LOGGED_OUT_ROUTES) {
    test(`${route.name} · ${theme} · logged out`, async ({ browser }) => {
      const ctx = await browser.newContext({
        storageState: { cookies: [], origins: [] },
        colorScheme: theme,
      })
      const page = await ctx.newPage()
      await forceTheme(page, theme)
      await page.goto(route.path)
      await settle(page)
      await page.screenshot({ path: `${OUT}/${route.name}-${theme}.png`, fullPage: true })
      await ctx.close()
    })
  }
}

/**
 * Phone width. Everything above is desktop, so without this the whole responsive
 * layer is outside what a design review can see. The real Pixel 7 preset rather
 * than a hand-typed viewport: it carries the device pixel ratio and user agent,
 * so captures match what a phone renders, not a narrow desktop window.
 */
test.describe('mobile', () => {
  // Strip defaultBrowserType: Playwright rejects it inside a describe because it
  // would force a new worker, and the project already runs chromium anyway. The
  // parts that matter for a mobile capture — viewport, DPR, UA, isMobile,
  // hasTouch — are all context options and pass through fine.
  const { defaultBrowserType: _ignored, ...pixel7 } = devices['Pixel 7']
  test.use(pixel7)

  for (const route of ROUTES) {
    test(`${route.name} · mobile`, async ({ page }) => {
      await page.goto(route.path)
      await settle(page)
      await page.screenshot({ path: `${OUT}/mobile-${route.name}.png`, fullPage: true })
    })
  }
})
