import { expect, test } from '@playwright/test'

import { PASSWORD } from '../scripts/seed/fixtures'
import { login, SIGNED_OUT } from './auth'
import { newTenantAdmin } from './tenant'

test.use({ storageState: SIGNED_OUT })

// Preferences are saved on the account: set them once, sign in from a fresh browser, they are back.
test('user preferences follow the account', async ({ page, browser }) => {
  const email = await newTenantAdmin(PASSWORD)
  await login(page, email)
  await page.goto('/account')
  await page.waitForLoadState('networkidle')
  const choose = async (id: string, name: RegExp) => {
    await page.getByTestId(id).click()
    await page.getByRole('option', { name }).click()
  }
  await choose('pref-theme', /Dark|Tamna/)
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByTestId('pref-accent').locator('[data-accent="teal"]').click()
  await page.getByTestId('pref-font').locator('[data-font="geist"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-font', 'geist')
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily))
    .toContain('Geist')
  await choose('pref-text-size', /125/)
  await expect(page.locator('html')).toHaveAttribute('data-text-size', '125')
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe(
    '20px',
  )
  await choose('pref-contrast', /High|Visok/)
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high')
  await choose('pref-motion', /no animations|bez animacija/)
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce')

  const fresh = await browser.newPage({ storageState: SIGNED_OUT })
  await login(fresh, email)
  await expect(fresh.locator('html')).toHaveClass(/dark/)
  await expect(fresh.locator('html')).toHaveAttribute('data-accent', 'teal')
  await expect(fresh.locator('html')).toHaveAttribute('data-font', 'geist')
  await expect(fresh.locator('html')).toHaveAttribute('data-text-size', '125')
  await expect(fresh.locator('html')).toHaveAttribute('data-contrast', 'high')
  await expect(fresh.locator('html')).toHaveAttribute('data-motion', 'reduce')
})

// 30 minutes without activity signs you out (clock fast-forwarded), with a notice on the login page.
test('idle sign-out after 30 minutes', async ({ page }) => {
  await page.clock.install()
  await login(page, await newTenantAdmin(PASSWORD))
  await page.waitForLoadState('networkidle')
  await page.clock.runFor(31 * 60_000)
  await expect(page).toHaveURL(/\/login\?idle=1/)
  await expect(page.getByTestId('idle-notice')).toBeVisible()
})

// The language choice survives a reload (it is a cookie before sign-in, a preference after).
test('the language toggle sticks', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const before = await page.locator('html').getAttribute('lang')
  await page.getByRole('button', { name: before === 'en' ? 'Srpski' : 'English' }).click()
  await expect(page.locator('html')).not.toHaveAttribute('lang', before!)
  const after = await page.locator('html').getAttribute('lang')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', after!)
})
