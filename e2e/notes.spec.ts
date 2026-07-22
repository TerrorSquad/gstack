import { expect, test } from '@playwright/test'

// Notes CRUD — the reference feature flow (create → appears → search → delete).
// Runs with the saved admin session against seeded local Supabase; RLS is
// exercised for real. Serial so the created note's lifecycle is deterministic.
test.describe.serial('notes CRUD', () => {
  const title = `E2E note ${Date.now()}`

  test('creates a note', async ({ page }) => {
    await page.goto('/notes/new')
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/Title|Naslov/).fill(title)
    await page.getByLabel(/Body|Sadržaj/).fill('created by playwright')
    await page.getByRole('button', { name: /^Save$|^Sačuvaj$/ }).click()

    await expect(page).toHaveURL(/\/notes$/)
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 })
  })

  test('filters to the note via search', async ({ page }) => {
    await page.goto('/notes')
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 })
    await page.getByPlaceholder(/Search notes|Pretraži beleške/).fill('E2E note')
    await expect(page.getByText(title)).toBeVisible()
  })

  test('deletes the note', async ({ page }) => {
    await page.goto('/notes')
    await page.waitForLoadState('networkidle') // let Vue hydrate before clicking
    const link = page.getByRole('link', {
      name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    })
    await expect(link).toBeVisible({ timeout: 15_000 })

    // The delete button is the sibling of the note link inside the same card row.
    await link.locator('xpath=following-sibling::button').first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 15_000 })
    await dialog.getByRole('button', { name: /^Confirm$|^Potvrdi$/ }).click()

    await expect(page.getByText(title)).toHaveCount(0, { timeout: 15_000 })
  })
})
