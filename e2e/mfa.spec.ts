import { expect, test, type Page } from '@playwright/test'

import { PASSWORD } from '../scripts/seed/fixtures'
import { login, SIGNED_OUT } from './auth'
import { newTenantAdmin } from './tenant'
import { totp } from './totp'

test.use({ storageState: SIGNED_OUT })

/** A code from a 30-second window not used yet (servers refuse reusing a code). */
async function freshCode(page: Page, secret: string, used: Set<string>) {
  for (;;) {
    const c = totp(secret)
    if (!used.has(c)) {
      used.add(c)
      return c
    }
    await page.waitForTimeout(2000)
  }
}

// Turn on two-factor login, then log in again: the code is required before any page or data.
test('two-factor login', async ({ page }) => {
  test.setTimeout(150_000)
  const email = await newTenantAdmin(PASSWORD)
  await login(page, email)
  await page.goto('/account')
  await page.waitForLoadState('networkidle')
  await page.getByTestId('mfa-enable').click()
  const secret = (await page.getByTestId('mfa-secret').innerText()).trim()
  const used = new Set<string>()
  await page.getByTestId('mfa-enroll-code').fill(await freshCode(page, secret, used))
  await page.getByTestId('mfa-confirm').click()
  await expect(page.getByTestId('mfa-on')).toBeVisible()

  // a new session: the password alone only gets you to the code prompt
  await page.context().clearCookies()
  await page.evaluate(() => localStorage.clear())
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.getByLabel(/Email/i).fill(email)
  await page
    .getByLabel(/Lozinka|Password/i)
    .first()
    .fill(PASSWORD)
  await page.getByRole('button', { name: /Prijavi se|Log in/ }).click()
  await expect(page).toHaveURL(/\/auth\/mfa/) // the login lands on the code prompt
  await page.goto('/notes')
  await expect(page).toHaveURL(/\/auth\/mfa/) // and no page is reachable around it

  await page.getByTestId('mfa-code').fill(await freshCode(page, secret, used))
  await expect(page).toHaveURL(/\/dashboard/)
  await page.goto('/notes')
  await expect(page).toHaveURL(/\/notes$/)

  // recovery codes: create them, then "lose the phone" and get in with one
  await page.goto('/account')
  await page.getByTestId('mfa-new-codes').click()
  const recovery = (await page.getByTestId('mfa-codes').locator('li').first().innerText()).trim()
  await page.context().clearCookies()
  await page.evaluate(() => localStorage.clear())
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.getByLabel(/Email/i).fill(email)
  await page
    .getByLabel(/Lozinka|Password/i)
    .first()
    .fill(PASSWORD)
  await page.getByRole('button', { name: /Prijavi se|Log in/ }).click()
  await expect(page).toHaveURL(/\/auth\/mfa/)
  await page.getByTestId('mfa-use-recovery').click()
  await page.getByTestId('mfa-recovery-code').fill(recovery)
  await page.getByTestId('mfa-recover').click()
  await expect(page).toHaveURL(/\/account/)
  await expect(page.getByTestId('mfa-enable')).toBeVisible() // authenticator removed: set up a new one
})
