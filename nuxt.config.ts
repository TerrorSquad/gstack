// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'node:fs'
const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // DevTools injects an on-page timing badge (closed shadow root) that pollutes
  // screenshot baselines. Off for the SCREENSHOTS=1 capture build.
  devtools: { enabled: process.env.SCREENSHOTS !== '1' },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@sentry/nuxt/module',
    // Vercel telemetry: no-op off Vercel, and Speed Insights paints a debug
    // badge + 404s on /_vercel/*.js that pollute screenshot baselines.
    ...(process.env.SCREENSHOTS === '1' ? [] : ['@vercel/speed-insights', '@vercel/analytics']),
  ],
  css: ['~/assets/css/main.css'],
  fonts: {
    families: [{ name: 'Hanken Grotesk', provider: 'google' }],
  },
  supabase: {
    redirect: false,
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
  sourcemap: {
    // 'hidden' generates maps for Sentry upload without referencing them in the bundle.
    client: 'hidden',
  },
  runtimeConfig: {
    // Server-only. Empty = the feature is off. Overridden by NUXT_* env vars.
    betterstackSourceToken: '',
    betterstackIngestUrl: '',
    resendKey: '',
    // Canonical public origin for building email links; empty = request origin.
    siteUrl: '',
    // Shared secret the Supabase DB webhook must send to the notification hook.
    notificationWebhookSecret: '',
    public: {
      version,
      // Notifications (in-app feed + bell + transactional emails) off by default —
      // flip NUXT_PUBLIC_NOTIFICATIONS_ENABLED=true to enable the whole subsystem.
      notificationsEnabled: false,
      // Sentry DSN is public-safe by design (write-only ingest key). Replace with
      // your own project's DSN.
      sentryDsn: '',
    },
  },
  sentry: {
    // Injects init into the server entry so serverless errors are captured
    // without a NODE_OPTIONS preload (which Vercel can't set).
    autoInjectServerSentry: 'top-level-import',
    sourceMapsUploadOptions: {
      // Fill in your Sentry org/project; SENTRY_AUTH_TOKEN gates upload at build.
      org: '',
      project: '',
    },
  },
})
