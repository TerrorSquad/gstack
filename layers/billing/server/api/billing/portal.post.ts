import type { Database } from '#shared/types/database.types'

import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

// Return a billing-portal URL for the current tenant's customer (manage/cancel).
export default defineEventHandler(async (event) => {
  const provider = useBillingProvider()
  if (!provider) throw createError({ statusCode: 503, message: 'billing not configured' })

  const client = await serverSupabaseClient(event)
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) throw createError({ statusCode: 401, message: 'unauthorized' })

  const db = serverSupabaseServiceRole<Database>(event)
  const { data: profile } = await db
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  if (!profile) throw createError({ statusCode: 404, message: 'profile not found' })

  const { data: sub } = await db
    .from('subscriptions')
    .select('external_customer_id')
    .eq('tenant_id', profile.tenant_id)
    .single()
  if (!sub?.external_customer_id)
    throw createError({ statusCode: 400, message: 'no active customer for this tenant' })

  const origin = useRuntimeConfig(event).siteUrl || getRequestURL(event).origin
  const { url } = await provider.createPortal({
    customerId: sub.external_customer_id,
    returnUrl: `${origin}/billing`,
  })
  return { url }
})
