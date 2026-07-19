// `pnpm doctor` — config sanity + pre-deploy preflight. Reports which subsystems
// are on/off and flags anything half-wired (a subsystem enabled but missing the
// keys it needs to work). Pure env inspection, no network calls. Loads .env if
// present (local); in CI/prod it reads the real process env. Exits non-zero when a
// required var is missing or an enabled subsystem is misconfigured, so it can gate
// a deploy step.
import 'dotenv/config'
import process from 'node:process'

import { consola } from 'consola'

const env = process.env
const has = (k: string) => !!env[k]?.trim()
const on = (k: string) => env[k]?.trim() === 'true'

let errors = 0
const ok = (m: string) => consola.success(m)
const info = (m: string) => consola.info(m)
const warn = (m: string) => consola.warn(m)
const fail = (m: string) => {
  errors++
  consola.error(m)
}

consola.log('')
consola.info('Core (required)')
for (const k of ['SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NUXT_SUPABASE_SECRET_KEY']) {
  has(k) ? ok(k) : fail(`${k} is not set`)
}

consola.log('')
consola.info('Security')
has('NUXT_CSURF_ENCRYPT_SECRET')
  ? ok('CSRF secret pinned')
  : warn('NUXT_CSURF_ENCRYPT_SECRET unset — fine locally, but in prod tokens reset every deploy (openssl rand -hex 32)')
has('UPSTASH_REDIS_REST_URL') && has('UPSTASH_REDIS_REST_TOKEN')
  ? ok('Rate limiting: Upstash (distributed)')
  : info('Rate limiting: in-memory fallback — set Upstash for serverless/multi-instance')

consola.log('')
consola.info('Auth providers')
for (const p of ['GITHUB', 'GOOGLE']) {
  const id = has(`SUPABASE_AUTH_EXTERNAL_${p}_CLIENT_ID`)
  const secret = has(`SUPABASE_AUTH_EXTERNAL_${p}_SECRET`)
  if (id && secret) ok(`${p} OAuth configured`)
  else if (id || secret) fail(`${p} OAuth half-configured — set both CLIENT_ID and SECRET`)
  else info(`${p} OAuth off`)
}

consola.log('')
consola.info('Observability')
has('NUXT_PUBLIC_SENTRY_DSN')
  ? has('SENTRY_AUTH_TOKEN')
    ? ok('Sentry: DSN + source-map upload')
    : warn('Sentry: DSN set but SENTRY_AUTH_TOKEN missing — no source maps uploaded')
  : info('Sentry off')
const bsToken = has('NUXT_BETTERSTACK_SOURCE_TOKEN')
const bsUrl = has('NUXT_BETTERSTACK_INGEST_URL')
if (bsToken && bsUrl) ok('BetterStack log forwarding on')
else if (bsToken || bsUrl) fail('BetterStack half-configured — set both SOURCE_TOKEN and INGEST_URL')
else info('BetterStack off')

consola.log('')
consola.info('Notifications')
if (on('NUXT_PUBLIC_NOTIFICATIONS_ENABLED')) {
  has('NUXT_RESEND_KEY') ? ok('Resend key set') : fail('Notifications ENABLED but NUXT_RESEND_KEY missing')
  has('NUXT_NOTIFICATION_WEBHOOK_SECRET')
    ? ok('Webhook secret set')
    : fail('Notifications ENABLED but NUXT_NOTIFICATION_WEBHOOK_SECRET missing')
} else info('Notifications off')

consola.log('')
consola.info('Billing')
if (on('NUXT_PUBLIC_BILLING_ENABLED')) {
  has('NUXT_POLAR_ACCESS_TOKEN') ? ok('Polar access token set') : fail('Billing ENABLED but NUXT_POLAR_ACCESS_TOKEN missing')
  has('NUXT_POLAR_WEBHOOK_SECRET') ? ok('Polar webhook secret set') : fail('Billing ENABLED but NUXT_POLAR_WEBHOOK_SECRET missing')
  has('NUXT_POLAR_PRICE_PRO') || has('NUXT_POLAR_PRICE_ENTERPRISE')
    ? ok('At least one Polar price id set')
    : warn('Billing ENABLED but no price ids — checkout CTAs have nothing to sell')
} else info('Billing off')

consola.log('')
consola.info('Prod')
has('NUXT_SITE_URL')
  ? ok('NUXT_SITE_URL set (canonical email/OG links)')
  : warn('NUXT_SITE_URL unset — email/OG links fall back to request origin')

consola.log('')
if (errors) {
  consola.error(`${errors} problem${errors > 1 ? 's' : ''} — not deploy-ready.`)
  process.exit(1)
}
consola.success('No blocking problems.')
