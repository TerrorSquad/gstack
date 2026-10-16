import type { H3Event } from 'h3'

import type { Database } from '#shared/types/database.types'

import { serverSupabaseServiceRole } from '#supabase/server'

// Public REST API auth: `Authorization: Bearer sk_…` → the key's tenant. Every /api/v1 query runs with the service
// role, so it MUST filter by the returned tenant id (the key decides the tenant; nothing in the request can).
export async function requireApiKey(event: H3Event) {
  await rateLimit(event, { limit: 120, windowMs: 60_000 })
  const key = getHeader(event, 'authorization')?.match(/^Bearer (sk_[0-9a-f]+)$/)?.[1]
  if (!key) throw createError({ statusCode: 401, message: 'missing API key' })
  const db = serverSupabaseServiceRole<Database>(event)
  const { data: tenant } = await db.rpc('api_key_tenant', { p_key: key })
  if (!tenant) throw createError({ statusCode: 401, message: 'invalid API key' })
  return { db, tenant }
}
