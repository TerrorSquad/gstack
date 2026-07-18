
// Invite someone to the admin's tenant. inviteUserByEmail emails a link (via
// GoTrue) and stamps tenant_id into user metadata; handle_new_user reads it and
// joins them to this tenant as a member. redirectTo is load-bearing — it must
// point at the set-password page or the invitee lands on "/" ("link expired").
export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)
  const { email } = await readBody<{ email?: string }>(event)

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw createError({ statusCode: 400, message: 'a valid email is required' })

  const origin = useRuntimeConfig(event).siteUrl || getRequestURL(event).origin
  const { error } = await db.auth.admin.inviteUserByEmail(email, {
    data: { tenant_id: admin.tenant_id },
    redirectTo: `${origin}/auth/set-password`,
  })
  // Most common failure: the email already has an account.
  if (error) throw createError({ statusCode: 422, message: error.message })
  return { ok: true }
})
