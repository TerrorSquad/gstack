import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Exclude Playwright e2e specs - vitest's default glob picks them up otherwise.
    // e2e/*.test.ts (vitest specs for e2e/fixtures.ts etc.) stay included.
    exclude: ['e2e/**/*.spec.ts', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      all: true, // count every included file, even ones no test imports
      // Gate covers PURE-LOGIC units only (CLAUDE.md: unit tests are pure logic,
      // no DOM/Supabase). Platform-bound files (Vue/H3/Supabase/browser APIs) and
      // CLI script entrypoints are covered by e2e or manual run, not unit tests,
      // so they're excluded rather than fake-mocked to hit a number.
      include: ['app/utils/**/*.ts', 'server/utils/**/*.ts', 'layers/**/server/utils/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        'app/utils/download.ts', // browser DOM (createElement/click)
        'server/utils/requireAdmin.ts', // H3 + Supabase server client
        'server/utils/rateLimit.ts', // getRedis/getLimiter/rateLimit need H3+Upstash; pure hit() is tested
        'layers/email/server/utils/emails.ts', // renders .vue templates
        'layers/billing/server/utils/billing.ts', // fetch/runtimeConfig methods; pure webhook logic is tested
      ],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
