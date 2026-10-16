import { expect, test } from '@playwright/test'

// After every production deploy (`pnpm deploy:prod` runs it; alone: SMOKE_URL=… pnpm smoke:prod). Each check is
// something that took a production app built on this starter down once: a CSRF secret of the wrong length (every
// page 500), masked Supabase keys in Vercel (health degraded), a locale file vue-i18n refused (raw keys on every
// page), OG images without NUXT_APP_SECRET.
const BASE = process.env.SMOKE_URL
test.skip(!BASE, 'set SMOKE_URL to the deployment to check')

test('health: the app reaches its database', async ({ request }) => {
  const r = await request.get(`${BASE}/api/health`)
  expect(await r.json()).toMatchObject({ status: 'ok' })
})

for (const path of ['/', '/login', '/register', '/privacy', '/terms']) {
  test(`${path} renders without errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    expect((await page.goto(BASE + path))?.status()).toBe(200)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toContainText(/\b(auth|login|nav)\.[a-z]+[A-Za-z]*\b/) // raw i18n keys
    expect(errors).toEqual([])
  })
}

test('the social preview image renders', async ({ page, request }) => {
  await page.goto(BASE + '/')
  const og = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect(og, 'og:image meta').toBeTruthy()
  const r = await request.get(new URL(og!, BASE).toString())
  expect(r.status(), og!).toBe(200)
  expect(r.headers()['content-type']).toMatch(/^image\//)
})

test('login reaches hosted auth', async ({ page }) => {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  const auth = page.waitForResponse((r) => r.url().includes('/auth/v1/token'))
  await page.locator('input[type=email]').fill('nobody@example.com')
  await page.locator('input[type=password]').fill('wrong-password-123')
  await page.locator('form button[type=submit]').click()
  expect((await auth).status()).toBe(400) // wrong credentials, but the round trip works
})
