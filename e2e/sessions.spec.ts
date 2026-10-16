import { expect, test } from '@playwright/test'

import { PASSWORD } from '../scripts/seed/fixtures'
import { login, SIGNED_OUT } from './auth'
import { newTenantAdmin } from './tenant'

test.use({ storageState: SIGNED_OUT })

// Two logins = two sessions; from the account page, sign the other device out.
test('signed-in devices: see and end other sessions', async ({ page, browser }) => {
  const email = await newTenantAdmin(PASSWORD)
  const other = await browser.newPage({ storageState: SIGNED_OUT })
  await login(other, email)
  await other.close()
  await login(page, email)
  await page.goto('/account')
  await expect(page.getByTestId('session-row')).toHaveCount(2)
  await page.getByTestId('sessions-end-others').click()
  await expect(page.getByTestId('session-row')).toHaveCount(1)
  await expect(page.getByTestId('session-row')).toContainText(/This device|Ovaj uređaj/)
})
