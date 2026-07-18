import type { Database } from '#shared/types/database.types'

import { serverSupabaseServiceRole } from '#supabase/server'

// Billing provider webhook. Verifies the signature, normalizes the subscription
// event, and upserts the tenant's subscription row. Idempotent: upsert keyed on
// tenant_id (the PK), so redelivered events are safe.
export default defineEventHandler(async (event) => {
  const provider = useBillingProvider()
  if (!provider) return { ok: true, skipped: 'billing-disabled' }

  const rawBody = (await readRawBody(event)) ?? ''
  const headers: Record<string, string | undefined> = {
    'webhook-id': getRequestHeader(event, 'webhook-id'),
    'webhook-timestamp': getRequestHeader(event, 'webhook-timestamp'),
    'webhook-signature': getRequestHeader(event, 'webhook-signature'),
  }

  // Throws 401 on a bad signature.
  const sub = provider.parseWebhook(headers, rawBody)
  if (!sub) return { ok: true } // non-subscription event
  if (!sub.tenantId) return { ok: true, skipped: 'no-tenant-metadata' }

  if (!useRuntimeConfig(event).supabase.secretKey)
    throw createError({ statusCode: 500, message: 'NUXT_SUPABASE_SECRET_KEY not set' })
  const db = serverSupabaseServiceRole<Database>(event)
  const { error } = await db.from('subscriptions').upsert(
    {
      tenant_id: sub.tenantId,
      provider: 'polar',
      external_id: sub.externalId,
      external_customer_id: sub.externalCustomerId,
      plan: sub.plan,
      status: sub.status,
      current_period_end: sub.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'tenant_id' },
  )
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { ok: true }
})
