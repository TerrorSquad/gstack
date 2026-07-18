import type { H3Event } from 'h3'

import type { Database } from '#shared/types/database.types'

import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

// Guard for admin-only server routes. Verifies the caller is a signed-in admin
// and returns a service-role client + the admin's profile (id, tenant_id). All
// admin actions must additionally check the target user is in the SAME tenant —
// use assertSameTenant below.
//
// Note: we resolve the user via the cookie-authenticated client's getUser()
// rather than serverSupabaseUser(), which returns null in this module version.
export async function requireAdmin(event: H3Event) {
  const client = await serverSupabaseClient(event)
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) throw createError({ statusCode: 401, message: 'unauthorized' })
  if (!useRuntimeConfig(event).supabase.secretKey)
    throw createError({ statusCode: 500, message: 'NUXT_SUPABASE_SECRET_KEY not set' })

  const db = serverSupabaseServiceRole<Database>(event)
  const { data: admin } = await db
    .from('profiles')
    .select('id, tenant_id, role')
    .eq('id', user.id)
    .single()
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, message: 'forbidden' })
  return { db, admin }
}

// Loads the target profile and asserts it belongs to the admin's tenant and is
// not the admin themselves (self-mutation guards live at each call site).
export async function assertSameTenant(
  db: Awaited<ReturnType<typeof requireAdmin>>['db'],
  adminTenantId: string,
  targetUserId: string,
) {
  const { data: target } = await db
    .from('profiles')
    .select('id, tenant_id, email, full_name, role')
    .eq('id', targetUserId)
    .single()
  if (!target || target.tenant_id !== adminTenantId)
    throw createError({ statusCode: 404, message: 'user not found in your organisation' })
  return target
}
