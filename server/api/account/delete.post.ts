import type { Database } from '~/types/database.types'

import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

// GDPR self-service account deletion. Deletes the caller's own auth user; the
// profile + notes + notifications cascade from the FK on delete. Requires the
// service role (a user can't delete themselves via the anon/client key).
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) throw createError({ statusCode: 401, message: 'unauthorized' })
  if (!useRuntimeConfig(event).supabase.secretKey)
    throw createError({ statusCode: 500, message: 'NUXT_SUPABASE_SECRET_KEY not set' })

  const db = serverSupabaseServiceRole<Database>(event)
  const { error } = await db.auth.admin.deleteUser(user.id)
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { ok: true }
})
