import { describe, expect, it } from 'vitest'
import { shouldAttachCsrf } from './csrf'

const ORIGIN = 'https://app.example.com'

describe('shouldAttachCsrf', () => {
  it('attaches on same-origin mutations (relative + absolute)', () => {
    expect(shouldAttachCsrf('POST', '/api/admin/set-role', ORIGIN)).toBe(true)
    expect(shouldAttachCsrf('patch', `${ORIGIN}/api/x`, ORIGIN)).toBe(true)
  })

  it('skips safe methods', () => {
    expect(shouldAttachCsrf('GET', '/api/admin/users', ORIGIN)).toBe(false)
    expect(shouldAttachCsrf('HEAD', '/api/x', ORIGIN)).toBe(false)
  })

  it('never leaks the token cross-origin', () => {
    expect(shouldAttachCsrf('POST', 'https://evil.example.net/steal', ORIGIN)).toBe(false)
    expect(shouldAttachCsrf('POST', 'https://api.stripe.com/v1/x', ORIGIN)).toBe(false)
  })
})
