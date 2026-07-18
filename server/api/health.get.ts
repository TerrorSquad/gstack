import type { Database } from '~/types/database.types'

import { serverSupabaseServiceRole } from '#supabase/server'

// Liveness + DB-connectivity probe for uptime monitoring. `/` returns 200 even
// when Supabase is unreachable; this route does a trivial indexed select and
// returns 503 if it fails, giving the monitor teeth.
export default defineEventHandler(async (event) => {
  const started = Date.now()

  if (!useRuntimeConfig(event).supabase.secretKey) {
    setResponseStatus(event, 503)
    return { status: 'degraded', db: 'unconfigured' }
  }

  try {
    const admin = serverSupabaseServiceRole<Database>(event)
    const { error } = await admin.from('profiles').select('id', { head: true, count: 'exact' })
    if (error) throw error
    return { status: 'ok', db: 'ok', latencyMs: Date.now() - started }
  } catch {
    setResponseStatus(event, 503)
    return { status: 'degraded', db: 'error', latencyMs: Date.now() - started }
  }
})
