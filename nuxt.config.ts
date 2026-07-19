// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'node:fs'
const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Feature layers — each owns its pages/components/composables/server routes.
  // Shared foundation (auth, UI, layouts, stores, utils) lives in this root
  // project; types live in shared/ (#shared). See docs/adr/0005-nuxt-layers.md.
  extends: [
    // Design-system layer — theme tokens, fonts, brand chrome. The single source
    // of truth every app (this one, plus any future marketing/docs deploy) shares
    // so the UI can't drift. See DESIGN.md.
    './layers/ui',
    './layers/marketing',
    './layers/notes',
    './layers/admin',
    './layers/account',
    './layers/billing',
  ],
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    'nuxt-og-image',
    'nuxt-security',
    '@sentry/nuxt/module',
    // Vercel telemetry: no-op off Vercel.
    '@vercel/speed-insights',
    '@vercel/analytics',
  ],
  // Security headers + CSP (nuxt-security). CSP is nonce-based for scripts; the
  // external hosts our stack talks to are allowlisted per-directive. Its own
  // rate limiter is off — we use server/utils/rateLimit (Upstash/in-memory).
  // CSRF: token protection (double-submit, httpOnly secret cookie) via nuxt-csurf
  // on POST/PUT/PATCH — layered over the SameSite=Lax auth cookies. All app calls
  // carry the token automatically (plugins/csrf.client.ts); machine callers that
  // can't send it (webhooks, Sentry tunnel) are excluded via routeRules below.
  security: {
    rateLimiter: false,
    csrf: { methodsToProtect: ['POST', 'PUT', 'PATCH'] },
    headers: {
      crossOriginEmbedderPolicy: false, // would block cross-origin fonts/images
      contentSecurityPolicy: {
        'script-src': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"],
        'connect-src': [
          "'self'",
          'https://*.supabase.co',
          'wss://*.supabase.co',
          'http://127.0.0.1:54321',
          'ws://127.0.0.1:54321',
          'https://vitals.vercel-insights.com',
        ],
        'img-src': ["'self'", 'data:', 'blob:', 'https://*.supabase.co'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
      },
    },
  },
  // CSRF-exempt the machine callers: external webhooks (HMAC/secret-verified in
  // the handler) and the browser Sentry tunnel (Sentry's SDK uses its own
  // transport and can't send our token). Everything else stays protected.
  routeRules: {
    '/api/hooks/**': { csurf: false },
    '/api/sentry': { csurf: false },
  },
  // Public site identity for SEO/sitemap/canonical. Override in prod with
  // NUXT_PUBLIC_SITE_URL (nuxt-site-config reads it automatically).
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    name: 'Starter',
  },
  // Advertise exactly the public marketing pages — authenticated app routes stay
  // out. Explicit list (auto-discovery off) so the sitemap is predictable.
  sitemap: {
    excludeAppSources: true,
    urls: ['/', '/pricing', '/terms', '/privacy', '/changelog', '/roadmap'],
  },
  supabase: {
    redirect: false,
    types: '~~/shared/types/database.types.ts',
  },
  i18n: {
    locales: [
      { code: 'sr', language: 'sr-Latn', name: 'Srpski', file: 'sr.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
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
    // Billing (Polar). Empty = billing off. See layers/billing + ADR-0001.
    polar: {
      accessToken: '',
      webhookSecret: '',
      server: 'sandbox', // 'sandbox' | 'production'
      // Provider price ids per plan id (from your Polar dashboard).
      pricePro: '',
      priceEnterprise: '',
    },
    public: {
      version,
      // Show billing UI + wire pricing CTAs to checkout. Off until Polar is set.
      billingEnabled: false,
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
