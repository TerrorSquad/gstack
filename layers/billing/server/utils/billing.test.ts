import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { verifyStandardWebhook } from './billing'

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
})
