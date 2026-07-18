// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'node:fs'
const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/supabase', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  fonts: {
    families: [{ name: 'Hanken Grotesk', provider: 'google' }],
  },
  supabase: {
    // We use our own role-aware global middleware instead of the
    // module's built-in redirect (see app/middleware/auth.global.ts).
    redirect: false,
    // Regenerate after schema/migration changes: `pnpm db:types`
    types: '~/types/database.types.ts',
  },
  i18n: {
    locales: [
      { code: 'sr', language: 'sr-Latn', name: 'Srpski', file: 'sr.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'sr',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
  },
  routeRules: {
    // Baseline security headers.
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  },
  nitro: {
    compressPublicAssets: true,
  },
  runtimeConfig: {
    public: {
      version,
    },
  },
})
