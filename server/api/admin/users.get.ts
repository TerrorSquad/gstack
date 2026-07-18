import { requireAdmin } from '../../utils/requireAdmin'

// Lists the admin's tenant members with their ban status (from auth.users, only
// reachable via the service role — hence a server route, not a client query).
export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)

  const { data: profiles, error } = await db
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .eq('tenant_id', admin.tenant_id)
    .order('created_at')
  if (error) throw createError({ statusCode: 500, message: error.message })

  // Ban status lives on auth.users; map it in.
  const { data: authUsers } = await db.auth.admin.listUsers({ perPage: 1000 })
  const bannedUntil = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, (u as { banned_until?: string }).banned_until]),
  )

  const now = Date.now()
  return (profiles ?? []).map((p) => {
    const until = bannedUntil.get(p.id)
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      role: p.role,
      created_at: p.created_at,
      banned: !!until && new Date(until).getTime() > now,
      isSelf: p.id === admin.id,
    }
  })
})
