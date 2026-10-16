import { expect, test } from '@playwright/test'

// Public login page renders without a DB — the cheapest proof the app boots.
// Add authenticated flows once your local Supabase is seeded.
test('login page renders the sign-in form', async ({ page }) => {
  await page.goto('/login')
  // SSR renders the form before Vue hydrates; wait so the handler is attached.
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('button', { name: /Prijavi se|Log in/ })).toBeVisible()
})

// The CSRF plugin must put the token on the app's own POSTs (Nuxt 4.6 binds $fetch at module load, so replacing the
// global no longer reached components and every POST to the API got 403 "CSRF Token not found").
test('same-origin POSTs carry the CSRF token', async ({ page }) => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  const body = await page.evaluate(async () =>
    (await fetch('/api/health', { method: 'POST', redirect: 'manual' })).text(),
  )
  expect(body).not.toContain('CSRF')
})

// One-click demo logins (NUXT_PUBLIC_SHOW_DEMO_ACCOUNTS, on for e2e): every button signs that user in.
test('demo account buttons sign in', async ({ page }) => {
  for (const name of ['Ada Admin', 'Milo Member']) {
    await page.context().clearCookies()
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page
      .getByTestId('demo-accounts')
      .getByRole('button', { name: new RegExp(name) })
      .click()
    await expect(page).toHaveURL(/\/dashboard/)
  }
})
