import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Exclude Playwright e2e specs - vitest's default glob picks them up otherwise.
    // e2e/*.test.ts (vitest specs for e2e/fixtures.ts etc.) stay included.
    exclude: ['e2e/**/*.spec.ts', 'node_modules/**'],
  },
})
