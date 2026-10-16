import { expect, test } from '@playwright/test'

// An admin creates an API key; the read-only API answers with that tenant's data, and stops after revoking.
test('API key: create, use, revoke', async ({ page, request }) => {
  const name = `E2E integration ${Date.now()}` // the demo tenant keeps keys from earlier runs
  await page.goto('/admin')
  await page.waitForLoadState('networkidle')
  await page.getByTestId('api-key-name').fill(name)
  await page.getByTestId('api-key-create').click()
  const key = (await page.getByTestId('api-key-value').innerText()).trim()
  expect(key).toMatch(/^sk_/)

  const notes = await request.get('/api/v1/notes', { headers: { Authorization: `Bearer ${key}` } })
  expect(notes.status()).toBe(200)
  expect((await notes.json()).length).toBeGreaterThan(0)
  expect((await request.get('/api/v1/notes')).status()).toBe(401)

  await page
    .getByTestId('api-keys')
    .locator('li')
    .filter({ hasText: name })
    .getByRole('button', { name: /Revoke|Opozovi/ })
    .click()
  await expect(page.getByTestId('api-keys').locator('li').filter({ hasText: name })).toContainText(
    /Revoked|Opozvan/,
  )
  expect(
    (await request.get('/api/v1/notes', { headers: { Authorization: `Bearer ${key}` } })).status(),
  ).toBe(401)
})
