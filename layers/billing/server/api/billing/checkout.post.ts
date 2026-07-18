import type { Database } from '#shared/types/database.types'

import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

// Create a checkout session for a plan and return its URL. Auth'd; the tenant id
// + plan ride along as metadata so the webhook can attribute the subscription.
export default defineEventHandler(async (event) => {
  const provider = useBillingProvider()
  if (!provider) throw createError({ statusCode: 503, message: 'billing not configured' })

  const client = await serverSupabaseClient(event)
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) throw createError({ statusCode: 401, message: 'unauthorized' })

  const { plan } = await readBody<{ plan?: string }>(event)
  const config = useRuntimeConfig(event).polar
  const priceId =
    plan === 'pro' ? config.pricePro : plan === 'enterprise' ? config.priceEnterprise : ''
  if (!priceId) throw createError({ statusCode: 400, message: 'unknown or unpriced plan' })

  const db = serverSupabaseServiceRole<Database>(event)
  const { data: profile } = await db
    .from('profiles')
    .select('tenant_id, email')
    .eq('id', user.id)
    .single()
  if (!profile) throw createError({ statusCode: 404, message: 'profile not found' })

  const origin = useRuntimeConfig(event).siteUrl || getRequestURL(event).origin
  const { url } = await provider.createCheckout({
    priceId,
    customerEmail: profile.email,
    successUrl: `${origin}/billing?success=1`,
    metadata: { tenant_id: profile.tenant_id, plan: plan! },
  })
  return { url }
})
