import { describe, expect, it } from 'vitest'

import { totp } from './totp'

describe('totp', () => {
  it('matches the RFC 6238 test vector (SHA-1)', () => {
    const key = Buffer.from('12345678901234567890')
    expect(totp(key, 59_000, 8)).toBe('94287082')
    expect(totp(key, 1_111_111_109_000, 8)).toBe('07081804')
  })
  it('accepts base32 secrets', () => {
    expect(totp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 59_000, 8)).toBe('94287082')
  })
})
