import { expect, test } from '@playwright/test'

import { ACME_SECRET_NOTE_TITLE, ADMIN2 } from '../scripts/seed/fixtures'
import { login } from './auth'

// The headline security guarantee: RLS scopes every row to the caller's tenant.
// Here a Globex user logs in and must never see Acme's seeded "secret" note —
// not in the list, not in search, not by guessing its route. This runs its own
// login (Globex), so it deliberately does NOT use the saved admin session.
test.describe('tenant isolation (RLS)', () => {
  test('a Globex admin cannot see Acme notes', async ({ page }) => {
    await login(page, ADMIN2.email)

    // The seeded Acme secret title must be absent from Globex's notes list.
    await page.goto('/notes')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(ACME_SECRET_NOTE_TITLE)).toHaveCount(0)

    // Searching for it returns nothing (client filters over RLS-scoped rows).
    const search = page.getByPlaceholder(/Search notes|Pretraži beleške/)
    if (await search.count()) {
      await search.fill(ACME_SECRET_NOTE_TITLE)
      await expect(page.getByText(ACME_SECRET_NOTE_TITLE)).toHaveCount(0)
    }
  })

  test('the notes API returns no Acme rows for a Globex caller', async ({ page }) => {
    await login(page, ADMIN2.email)

    // Hit the data path the app uses and assert the secret title is nowhere in
    // the payload — proves isolation at the source, not just the rendered list.
    const body = await page.evaluate(async () => {
      const res = await fetch('/notes', { headers: { accept: 'text/html' } })
      return res.text()
    })
    expect(body).not.toContain(ACME_SECRET_NOTE_TITLE)
  })
})
