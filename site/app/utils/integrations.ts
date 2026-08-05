import { integrations } from '#manifest'

/**
 * Marries the starter's subsystem manifest to this site's editorial copy.
 *
 * The split matters. FACTS — flag name, category, whether a subsystem needs
 * external keys — come from `scripts/integrations.ts`, the file `pnpm setup`
 * and `pnpm doctor` already read. PROSE lives here, because "what does turning
 * this on actually give me" is marketing copy, not configuration.
 *
 * Before this existed the docs table was hand-maintained and had already
 * drifted: it was missing billing and BetterStack outright, and listed
 * PostHog's session-replay toggle as if it were its own subsystem.
 *
 * `describe()` throws when the manifest gains a subsystem nobody has written
 * copy for, so adding one to the starter fails this build rather than quietly
 * shipping docs that omit it.
 */

/** Human-facing account name, or null when the subsystem is self-hosted. */
const ACCOUNT: Record<string, string | null> = {
  'supabase': null,
  'feedback': null,
  'tour': null,
  'notifications': 'Resend',
  'posthog': 'PostHog',
  'billing': 'Polar',
  'github-oauth': 'GitHub',
  'google-oauth': 'Google',
  'sentry': 'Sentry',
  'betterstack': 'BetterStack',
}

const BLURB: Record<string, string> = {
  'supabase': 'Postgres, Auth, Row Level Security, Storage and Realtime. Runs locally in Docker, so development and CI need no hosted project.',
  'feedback': 'A floating widget for signed-in users that submits to your own feedback table, RLS-scoped like everything else. Users read their own; admins read the tenant’s.',
  'tour': 'A first-run product tour that targets nav links by href, so restyling the nav doesn’t break it. Completion is remembered per browser.',
  'notifications': 'A database trigger fans a new note out to tenant admins as notification rows; a Supabase webhook mirrors each row to email. In-app feed and bell included.',
  'posthog': 'Pageviews and useFeatureFlag(key, fallback) — a reactive flag that degrades to its fallback when PostHog is off, so gated UI still works on a bare clone.',
  'billing': 'Checkout, customer portal and webhooks behind an adapter. A Merchant of Record, which is why it is here instead of Stripe — it onboards sellers in countries Stripe will not.',
  'github-oauth': 'Social login alongside email and password. The login page buttons are already wired; you supply the client id and secret.',
  'google-oauth': 'The same, for Google. Both are enabled in supabase/config.toml rather than in app code.',
  'sentry': 'Error tracking, with hidden source maps generated for upload but never referenced in the bundle.',
  'betterstack': 'Server log forwarding from Nitro.',
}

/** Order the categories read in, rather than the order they appear in the manifest. */
const CATEGORY_ORDER = ['core', 'security', 'growth', 'billing', 'observability'] as const

const CATEGORY_LABEL: Record<string, string> = {
  core: 'Core',
  security: 'Security',
  growth: 'Growth',
  billing: 'Billing',
  observability: 'Observability',
}

export interface Subsystem {
  id: string
  label: string
  category: string
  categoryLabel: string
  /** Env flag that toggles it, or null when presence of the keys is the switch. */
  flag: string | null
  account: string | null
  blurb: string
  requiredKeys: string[]
}

function describe(id: string): { account: string | null, blurb: string } {
  if (!(id in BLURB) || !(id in ACCOUNT)) {
    throw new Error(
      `integrations: no site copy for subsystem "${id}". It was added to `
      + `scripts/integrations.ts — add an ACCOUNT and BLURB entry in `
      + `site/app/utils/integrations.ts so the docs don't silently omit it.`,
    )
  }
  return { account: ACCOUNT[id]!, blurb: BLURB[id]! }
}

export const subsystems: Subsystem[] = integrations.map((item) => {
  const { account, blurb } = describe(item.id)
  return {
    id: item.id,
    // Manifest labels carry setup-wizard asides like "(core — always on)".
    label: item.label.replace(/\s*\(.*\)\s*$/, ''),
    category: item.category,
    categoryLabel: CATEGORY_LABEL[item.category] ?? item.category,
    flag: item.flag ?? null,
    account,
    blurb,
    requiredKeys: item.required.map(v => v.key),
  }
})

/** Grouped for display, categories in reading order, empty ones dropped. */
export const subsystemGroups = CATEGORY_ORDER
  .map(category => ({
    category,
    label: CATEGORY_LABEL[category]!,
    items: subsystems.filter(s => s.category === category),
  }))
  .filter(group => group.items.length > 0)

/** The headline claim on the landing page, computed rather than asserted. */
export const noAccountCount = subsystems.filter(s => s.account === null).length
