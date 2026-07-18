import { assertSameTenant, requireAdmin } from '../../utils/requireAdmin'

// Ban or unban a tenant member via Supabase's native ban (blocks login).
// ban_duration 'none' lifts it; a long duration is an effective permanent ban.
export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)
  const { userId, banned } = await readBody<{ userId?: string; banned?: boolean }>(event)

  if (!userId || typeof banned !== 'boolean')
    throw createError({ statusCode: 400, message: 'userId and banned (boolean) required' })
  if (userId === admin.id)
    throw createError({ statusCode: 400, message: "you can't ban yourself" })

  await assertSameTenant(db, admin.tenant_id, userId)
  const { error } = await db.auth.admin.updateUserById(userId, {
    ban_duration: banned ? '876000h' : 'none',
  })
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { ok: true }
})
