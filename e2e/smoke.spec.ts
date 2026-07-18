import { expect, test } from '@playwright/test'

// Public login page renders without a DB — the cheapest proof the app boots.
// Add authenticated flows once your local Supabase is seeded.
test('login page renders the sign-in form', async ({ page }) => {
  await page.goto('/login')
  // SSR renders the form before Vue hydrates; wait so the handler is attached.
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('button', { name: /Prijavi se|Log in/ })).toBeVisible()
})
