import { createHmac, timingSafeEqual } from 'node:crypto'

import type { SubscriptionStatus } from '#shared/types'

// Provider-agnostic billing. Polar is the default implementation (ADR-0001);
// Paddle/Freemius can implement the same BillingProvider interface and the rest
// of the app is unchanged.

export interface CheckoutParams {
  priceId: string
  customerEmail: string
  successUrl: string
  metadata: Record<string, string>
}
export interface PortalParams {
  customerId: string
  returnUrl: string
}
export interface NormalizedSubscription {
  externalId: string
  externalCustomerId: string | null
  tenantId: string | null // from checkout metadata
  plan: string // from checkout metadata
  status: SubscriptionStatus
  currentPeriodEnd: string | null
}

export interface BillingProvider {
  createCheckout(p: CheckoutParams): Promise<{ url: string }>
  createPortal(p: PortalParams): Promise<{ url: string }>
  /** Verify the webhook signature and normalize a subscription event, or null. */
  parseWebhook(
    headers: Record<string, string | undefined>,
    rawBody: string,
  ): NormalizedSubscription | null
}

// --- Standard Webhooks signature verification (Polar uses this spec) ----------
// Exported for unit testing. secret is the base64 key, optionally "whsec_"-prefixed.
export function verifyStandardWebhook(
  secret: string,
  headers: { id?: string; timestamp?: string; signature?: string },
  body: string,
): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature) return false
  const key = secret.startsWith('whsec_') ? secret.slice(6) : secret
  const expected = createHmac('sha256', Buffer.from(key, 'base64'))
    .update(`${id}.${timestamp}.${body}`)
    .digest('base64')
  const expBuf = Buffer.from(expected)
  // Header is space-separated "v1,<sig>" pairs; any match passes.
  return signature.split(' ').some((part) => {
    const sig = part.split(',')[1]
    if (!sig) return false
    const sigBuf = Buffer.from(sig)
    return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf)
  })
}

function mapPolarStatus(s: string): SubscriptionStatus {
  switch (s) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'incomplete'
  }
}

// Returns the configured provider, or null when billing isn't set up (so routes
// can 503 cleanly and the zero-config template still runs).
export function useBillingProvider(): BillingProvider | null {
  const c = useRuntimeConfig().polar
  if (!c.accessToken || !c.webhookSecret) return null
  return createPolarProvider({
    accessToken: c.accessToken,
    webhookSecret: c.webhookSecret,
    server: c.server,
  })
}

export function createPolarProvider(config: {
  accessToken: string
  webhookSecret: string
  server: string
}): BillingProvider {
  const base = config.server === 'production' ? 'https://api.polar.sh' : 'https://sandbox-api.polar.sh'
  const authHeaders = {
    Authorization: `Bearer ${config.accessToken}`,
    'Content-Type': 'application/json',
  }

  return {
    async createCheckout({ priceId, customerEmail, successUrl, metadata }) {
      const res = await fetch(`${base}/v1/checkouts/`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          product_price_id: priceId,
          success_url: successUrl,
          customer_email: customerEmail,
          metadata,
        }),
      })
      if (!res.ok) throw createError({ statusCode: 502, message: await res.text() })
      const data = (await res.json()) as { url: string }
      return { url: data.url }
    },

    async createPortal({ customerId, returnUrl }) {
      const res = await fetch(`${base}/v1/customer-sessions/`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ customer_id: customerId, return_url: returnUrl }),
      })
      if (!res.ok) throw createError({ statusCode: 502, message: await res.text() })
      const data = (await res.json()) as { customer_portal_url: string }
      return { url: data.customer_portal_url }
    },

    parseWebhook(headers, rawBody) {
      const ok = verifyStandardWebhook(config.webhookSecret, {
        id: headers['webhook-id'],
        timestamp: headers['webhook-timestamp'],
        signature: headers['webhook-signature'],
      }, rawBody)
      if (!ok) throw createError({ statusCode: 401, message: 'invalid signature' })

      const event = JSON.parse(rawBody) as {
        type: string
        data: {
          id: string
          customer_id?: string
          status: string
          current_period_end?: string | null
          metadata?: Record<string, string>
        }
      }
      if (!event.type.startsWith('subscription.')) return null
      const d = event.data
      return {
        externalId: d.id,
        externalCustomerId: d.customer_id ?? null,
        tenantId: d.metadata?.tenant_id ?? null,
        plan: d.metadata?.plan ?? 'free',
        status: mapPolarStatus(d.status),
        currentPeriodEnd: d.current_period_end ?? null,
      }
    },
  }
}
