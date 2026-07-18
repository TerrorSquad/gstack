
// Change a tenant member's role. Guards: same tenant, not yourself (avoid
// self-lockout), valid role.
export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)
  const { userId, role } = await readBody<{ userId?: string; role?: string }>(event)

  if (!userId || (role !== 'admin' && role !== 'member'))
    throw createError({ statusCode: 400, message: 'userId and role (admin|member) required' })
  if (userId === admin.id)
    throw createError({ statusCode: 400, message: "you can't change your own role" })

  await assertSameTenant(db, admin.tenant_id, userId)
  const { error } = await db.from('profiles').update({ role }).eq('id', userId)
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { ok: true }
})
