import { expect, test } from '@playwright/test'

// Feedback flow: an authenticated user opens the widget, submits, and (as admin)
// sees the submission on the admin feedback page. Runs with the saved admin
// session; the webServer sets NUXT_PUBLIC_FEEDBACK_ENABLED=true so the widget +
// nav link render. RLS is exercised for real against seeded local Supabase.
test('admin submits feedback and sees it in the admin list', async ({ page }) => {
  const message = `E2E feedback ${Date.now()}`

  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  // Open the floating widget (accessible name comes from its aria-label) and submit.
  await page.getByRole('button', { name: /Open feedback form|Otvori formu za utiske/ }).click()
  await page.getByRole('textbox').fill(message)
  await page.getByRole('button', { name: /^Send$|^Pošalji$/ }).click()

  // Toast confirms the insert succeeded (first match — an aria-live announcer
  // duplicates the visible title).
  await expect(page.getByText(/Thanks for your feedback|Hvala na povratnim/).first()).toBeVisible()

  // The admin feedback page shows the submission (RLS returns the tenant's rows).
  // The list fetches client-side, so wait on the row itself, not networkidle.
  await page.goto('/feedback/admin')
  await expect(page.getByText(message)).toBeVisible({ timeout: 15_000 })
})
