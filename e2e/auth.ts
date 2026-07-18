import { expect, type Page } from '@playwright/test'

import { PASSWORD } from '../scripts/seed/fixtures'

// Logs in via the real form. Nuxt SSR renders the form before Vue hydrates, so
// wait for networkidle or the native submit fires instead of the Vue handler.
export async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.getByLabel(/Email/i).fill(email)
  await page.getByLabel(/Lozinka|Password/i).first().fill(password)
  await page.getByRole('button', { name: /Prijavi se|Log in/ }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}
