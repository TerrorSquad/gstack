// `pnpm doctor` — config sanity + pre-deploy preflight. Reports which subsystems
// are on/off and flags anything half-wired (a subsystem enabled but missing the
// keys it needs to work). Pure env inspection, no network calls. Loads .env if
// present (local); in CI/prod it reads the real process env. Exits non-zero when a
// required var is missing or an enabled subsystem is misconfigured, so it can gate
// a deploy step. The npm script passes --env-file-if-exists=.env so it loads
// local env without erroring in CI/prod where there's no .env file.
import process from 'node:process'

import { consola } from 'consola'

import { integrations } from './integrations'

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
  if (has(k)) ok(k)
  else fail(`${k} is not set`)
}

consola.log('')
consola.info('Security')
if (has('NUXT_CSURF_ENCRYPT_SECRET')) ok('CSRF secret pinned')
else warn('NUXT_CSURF_ENCRYPT_SECRET unset — fine locally, but in prod tokens reset every deploy (openssl rand -hex 32)')
if (has('UPSTASH_REDIS_REST_URL') && has('UPSTASH_REDIS_REST_TOKEN')) ok('Rate limiting: Upstash (distributed)')
else info('Rate limiting: in-memory fallback — set Upstash for serverless/multi-instance')

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
if (!has('NUXT_PUBLIC_SENTRY_DSN')) info('Sentry off')
else if (has('SENTRY_AUTH_TOKEN')) ok('Sentry: DSN + source-map upload')
else warn('Sentry: DSN set but SENTRY_AUTH_TOKEN missing — no source maps uploaded')
const bsToken = has('NUXT_BETTERSTACK_SOURCE_TOKEN')
const bsUrl = has('NUXT_BETTERSTACK_INGEST_URL')
if (bsToken && bsUrl) ok('BetterStack log forwarding on')
else if (bsToken || bsUrl) fail('BetterStack half-configured — set both SOURCE_TOKEN and INGEST_URL')
else info('BetterStack off')

// Flag-gated subsystems, checked generically from the shared manifest so this
// script and `pnpm setup` never drift. Bespoke pairings (OAuth, BetterStack)
// stay hand-written above; anything with a plain flag + required/optional keys
// lives in scripts/integrations.ts.
for (const it of integrations) {
  if (!it.flag) continue
  consola.log('')
  consola.info(it.label)
  if (!on(it.flag)) {
    info(`${it.id} off`)
    continue
  }
  for (const v of it.required) {
    if (has(v.key)) ok(v.key)
    else fail(`${it.label} ENABLED but ${v.key} missing`)
  }
  for (const v of it.optional ?? []) {
    if (has(v.key)) ok(v.key)
    else warn(`${v.key} unset${v.hint ? ` — ${v.hint}` : ''}`)
  }
}

consola.log('')
consola.info('Prod')
if (has('NUXT_SITE_URL')) ok('NUXT_SITE_URL set (canonical email/OG links)')
else warn('NUXT_SITE_URL unset — email/OG links fall back to request origin')

consola.log('')
if (errors) {
  consola.error(`${errors} problem${errors > 1 ? 's' : ''} — not deploy-ready.`)
  process.exit(1)
}
consola.success('No blocking problems.')
