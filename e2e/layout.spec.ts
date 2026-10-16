import { expect, test, type Page } from '@playwright/test'

import { layoutProblems } from './layout'

// Layout rules (e2e/layout.ts) on every page, at desktop and phone width, in Serbian (the longer words):
// no sideways scroll, no overlapping controls, breathing room between blocks, headings near their content, no
// cut-off labels, no raw i18n keys, no Cyrillic. Add a page here when you add one to the app.
const SIGNED_IN = [
  '/dashboard',
  '/notes',
  '/notes/new',
  '/account',
  '/admin',
  '/billing',
  '/feedback/admin',
]
const PUBLIC = [
  '/',
  '/pricing',
  '/terms',
  '/privacy',
  '/changelog',
  '/roadmap',
  '/login',
  '/register',
]

async function check(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  expect.soft(await layoutProblems(page), path).toEqual([])
}

for (const [label, viewport] of [
  ['desktop', { width: 1280, height: 800 }],
  ['phone', { width: 390, height: 844 }],
] as const) {
  test.describe(label, () => {
    test.use({ viewport })
    test.beforeEach(async ({ context }) =>
      context.addCookies([{ name: 'lang', value: 'sr', url: 'http://localhost' }]),
    )
    for (const path of SIGNED_IN) test(path, async ({ page }) => check(page, path))
    test.describe('signed out', () => {
      test.use({ storageState: { cookies: [], origins: [] } })
      for (const path of PUBLIC) test(path, async ({ page }) => check(page, path))
    })
  })
}
