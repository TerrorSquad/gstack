import { test as setup } from '@playwright/test'
import path from 'node:path'

import { ADMIN } from '../scripts/seed/fixtures'
import { login } from './auth'

const authFile = path.join(import.meta.dirname, '.auth.json')

setup('log in as admin', async ({ page }) => {
  await login(page, ADMIN.email)
  await page.context().storageState({ path: authFile })
})
