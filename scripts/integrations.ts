// Single source of truth for every flag-gated subsystem's env shape.
// Consumed by scripts/setup.ts (writes .env) and scripts/doctor.ts (verifies).
export interface IntegrationVar {
  key: string
  hint?: string
}

export interface Integration {
  id: string
  label: string
  category: 'core' | 'security' | 'growth' | 'billing' | 'observability'
  /** Env flag that enables it. Absent = always-on core, no on/off toggle. */
  flag?: string
  /** Must be present when enabled (doctor fails if missing). */
  required: IntegrationVar[]
  /** Nice-to-have when enabled (doctor warns if missing). */
  optional?: IntegrationVar[]
}

export const integrations: Integration[] = [
  {
    id: 'supabase',
    label: 'Supabase (core — always on)',
    category: 'core',
    required: [
      { key: 'SUPABASE_URL' },
      { key: 'SUPABASE_KEY' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY' },
      { key: 'NUXT_SUPABASE_SECRET_KEY' },
    ],
  },
  {
    id: 'github-oauth',
    label: 'GitHub OAuth login',
    category: 'security',
    required: [
      { key: 'SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID' },
      { key: 'SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET' },
    ],
  },
  {
    id: 'google-oauth',
    label: 'Google OAuth login',
    category: 'security',
    required: [
      { key: 'SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID' },
      { key: 'SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET' },
    ],
  },
  {
    id: 'sentry',
    label: 'Sentry error tracking',
    category: 'observability',
    required: [{ key: 'NUXT_PUBLIC_SENTRY_DSN' }],
    optional: [{ key: 'SENTRY_AUTH_TOKEN', hint: 'enables source-map upload' }],
  },
  {
    id: 'betterstack',
    label: 'BetterStack log forwarding',
    category: 'observability',
    required: [
      { key: 'NUXT_BETTERSTACK_SOURCE_TOKEN' },
      { key: 'NUXT_BETTERSTACK_INGEST_URL' },
    ],
  },
  {
    id: 'notifications',
    label: 'Email notifications',
    category: 'growth',
    flag: 'NUXT_PUBLIC_NOTIFICATIONS_ENABLED',
    required: [
      { key: 'NUXT_RESEND_KEY', hint: 'Resend API key' },
      { key: 'NUXT_NOTIFICATION_WEBHOOK_SECRET', hint: 'Supabase DB webhook secret' },
    ],
  },
  {
    id: 'feedback',
    label: 'Feedback widget (self-hosted → DB)',
    category: 'growth',
    flag: 'NUXT_PUBLIC_FEEDBACK_ENABLED',
    // No external keys — submits to the feedback table via Supabase (core).
    required: [],
  },
  {
    id: 'tour',
    label: 'Onboarding tour (driver.js)',
    category: 'growth',
    flag: 'NUXT_PUBLIC_TOUR_ENABLED',
    // No external keys — a client-side first-run product tour.
    required: [],
  },
  {
    id: 'posthog',
    label: 'PostHog product analytics + feature flags',
    category: 'growth',
    flag: 'NUXT_PUBLIC_POSTHOG_ENABLED',
    required: [{ key: 'NUXT_PUBLIC_POSTHOG_KEY', hint: 'PostHog project API key (public-safe)' }],
    optional: [
      { key: 'NUXT_PUBLIC_POSTHOG_HOST', hint: 'defaults to https://us.i.posthog.com' },
      { key: 'NUXT_PUBLIC_POSTHOG_SESSION_REPLAY', hint: 'true to record session replays' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing (Polar)',
    category: 'billing',
    flag: 'NUXT_PUBLIC_BILLING_ENABLED',
    required: [
      { key: 'NUXT_POLAR_ACCESS_TOKEN' },
      { key: 'NUXT_POLAR_WEBHOOK_SECRET' },
    ],
    optional: [
      { key: 'NUXT_POLAR_PRICE_PRO', hint: 'price id for the Pro plan' },
      { key: 'NUXT_POLAR_PRICE_ENTERPRISE', hint: 'price id for the Enterprise plan' },
    ],
  },
]
