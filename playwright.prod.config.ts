import { config } from 'dotenv'

config({ quiet: true })

// Production smoke checks only (no local server): SMOKE_URL (in .env or the shell) is the deployment to check.
export default {
  testDir: './e2e',
  testMatch: /prod-smoke\.spec\.ts/,
  timeout: 60_000,
  reporter: 'line',
}
