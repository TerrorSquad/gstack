// GET /api/v1/notes — the tenant's notes (an example endpoint: copy it for your own tables, always filtering by
// the tenant the key resolved to).
export default defineEventHandler(async (event) => {
  const { db, tenant } = await requireApiKey(event)
  const { data, error } = await db
    .from('notes')
    .select('id, title, body, created_at, updated_at')
    .eq('tenant_id', tenant)
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
