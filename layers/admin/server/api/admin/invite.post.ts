// Invite someone to the admin's tenant. The invite is a tenant_invites row (only the
// service role writes it; signup metadata is client-controlled and never trusted);
// inviteUserByEmail emails a link via GoTrue, and handle_new_user joins the new
// account to the tenant its e-mail was invited to, as a member. redirectTo is load-bearing — it must
// point at the set-password page or the invitee lands on "/" ("link expired").
export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)
  const { email } = await readBody<{ email?: string }>(event)

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw createError({ statusCode: 400, message: 'a valid email is required' })

  const origin = useRuntimeConfig(event).siteUrl || getRequestURL(event).origin
  const invite = { email: email.toLowerCase(), invited_to: admin.tenant_id }
  const { error: e } = await db.from('tenant_invites').upsert(invite)
  if (e) throw createError({ statusCode: 500, message: e.message })
  const { error } = await db.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/set-password`,
  })
  // Most common failure: the email already has an account.
  if (error) {
    await db.from('tenant_invites').delete().eq('email', invite.email)
    throw createError({ statusCode: 422, message: error.message })
  }
  return { ok: true }
})
