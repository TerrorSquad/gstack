import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { createPolarProvider, verifyStandardWebhook } from './billing'

// Produce a valid Standard Webhooks signature the same way senders do.
function sign(secretB64: string, id: string, ts: string, body: string) {
  const sig = createHmac('sha256', Buffer.from(secretB64, 'base64'))
    .update(`${id}.${ts}.${body}`)
    .digest('base64')
  return `v1,${sig}`
}

describe('verifyStandardWebhook', () => {
  const secret = Buffer.from('super-secret-key').toString('base64')
  const id = 'msg_123'
  const ts = '1700000000'
  const body = '{"type":"subscription.active","data":{"id":"sub_1"}}'

  it('accepts a correctly signed payload', () => {
    const signature = sign(secret, id, ts, body)
    expect(verifyStandardWebhook(secret, { id, timestamp: ts, signature }, body)).toBe(true)
  })

  it('accepts the whsec_ prefixed form', () => {
    const signature = sign(secret, id, ts, body)
    expect(verifyStandardWebhook(`whsec_${secret}`, { id, timestamp: ts, signature }, body)).toBe(
      true,
    )
  })

  it('rejects a tampered body', () => {
    const signature = sign(secret, id, ts, body)
    expect(
      verifyStandardWebhook(secret, { id, timestamp: ts, signature }, body + 'x'),
    ).toBe(false)
  })

  it('rejects a wrong secret and missing headers', () => {
    const signature = sign(secret, id, ts, body)
    const other = Buffer.from('other').toString('base64')
    expect(verifyStandardWebhook(other, { id, timestamp: ts, signature }, body)).toBe(false)
    expect(verifyStandardWebhook(secret, { id, timestamp: ts }, body)).toBe(false)
  })

  it('rejects a signature header with no v1 part', () => {
    expect(verifyStandardWebhook(secret, { id, timestamp: ts, signature: 'v1,' }, body)).toBe(false)
  })
})

// parseWebhook + mapPolarStatus are pure given a valid signature; the provider's
// network methods (createCheckout/createPortal) hit fetch and are covered by e2e.
describe('createPolarProvider.parseWebhook', () => {
  const secret = Buffer.from('key').toString('base64')
  const provider = createPolarProvider({ accessToken: 't', webhookSecret: secret, server: 'sandbox' })

  function signedEvent(payload: object) {
    const body = JSON.stringify(payload)
    const id = 'msg_1'
    const ts = '1700000000'
    const sig = createHmac('sha256', Buffer.from(secret, 'base64'))
      .update(`${id}.${ts}.${body}`)
      .digest('base64')
    return {
      headers: { 'webhook-id': id, 'webhook-timestamp': ts, 'webhook-signature': `v1,${sig}` },
      body,
    }
  }

  it('rejects an invalid signature (does not parse the body)', () => {
    // parseWebhook throws before parsing when the signature check fails. It calls
    // Nuxt's auto-imported createError (undefined under vitest), so we assert on
    // the fact that it throws rather than a specific message.
    expect(() => provider.parseWebhook({}, '{}')).toThrow(Error)
  })

  it('returns null for non-subscription events', () => {
    const { headers, body } = signedEvent({ type: 'order.created', data: { id: 'o1', status: 'x' } })
    expect(provider.parseWebhook(headers, body)).toBeNull()
  })

  it('normalizes a subscription event and maps status', () => {
    const { headers, body } = signedEvent({
      type: 'subscription.updated',
      data: {
        id: 'sub_1',
        customer_id: 'cus_1',
        status: 'active',
        current_period_end: '2026-01-01',
        metadata: { tenant_id: 't1', plan: 'pro' },
      },
    })
    expect(provider.parseWebhook(headers, body)).toEqual({
      externalId: 'sub_1',
      externalCustomerId: 'cus_1',
      tenantId: 't1',
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: '2026-01-01',
    })
  })

  it('applies defaults and maps every status branch', () => {
    const cases: [string, string][] = [
      ['trialing', 'trialing'],
      ['past_due', 'past_due'],
      ['canceled', 'canceled'],
      ['unpaid', 'canceled'],
      ['incomplete_expired', 'canceled'],
      ['something_else', 'incomplete'],
    ]
    for (const [polar, expected] of cases) {
      const { headers, body } = signedEvent({
        type: 'subscription.created',
        data: { id: 'sub_x', status: polar },
      })
      expect(provider.parseWebhook(headers, body)).toMatchObject({
        externalCustomerId: null,
        tenantId: null,
        plan: 'free',
        status: expected,
        currentPeriodEnd: null,
      })
    }
  })
})
