
// Remove a tenant member. Deleting the auth user cascades their profile + notes.
export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)
  const { userId } = await readBody<{ userId?: string }>(event)

  if (!userId) throw createError({ statusCode: 400, message: 'userId required' })
  if (userId === admin.id)
    throw createError({ statusCode: 400, message: "you can't delete yourself here" })

  await assertSameTenant(db, admin.tenant_id, userId)
  const { error } = await db.auth.admin.deleteUser(userId)
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { ok: true }
})
