import { assertSameTenant, requireAdmin } from '../../utils/requireAdmin'

// Support impersonation: returns a one-time magic link that signs the caller in
// AS the target member. Opening it replaces the current session, so open it in a
// private/incognito window. Restricted to same-tenant members; never self.
//
// ponytail: magic-link impersonation — simple and uses only GoTrue. If you need
// to preserve the admin's own session while impersonating, that requires a
// custom dual-session scheme; add it only if support workflows demand it.
export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)
  const { userId } = await readBody<{ userId?: string }>(event)

  if (!userId) throw createError({ statusCode: 400, message: 'userId required' })
  if (userId === admin.id)
    throw createError({ statusCode: 400, message: "you can't impersonate yourself" })

  const target = await assertSameTenant(db, admin.tenant_id, userId)
  const origin = useRuntimeConfig(event).siteUrl || getRequestURL(event).origin

  const { data, error } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email: target.email,
    options: { redirectTo: `${origin}/dashboard` },
  })
  if (error || !data?.properties?.action_link)
    throw createError({ statusCode: 500, message: error?.message ?? 'could not create link' })

  // eslint-disable-next-line no-console
  console.info(`impersonation: admin=${admin.id} -> user=${userId}`) // audit trail
  return { link: data.properties.action_link }
})
