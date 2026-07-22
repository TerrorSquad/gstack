import { describe, expect, it } from 'vitest'

import { isFulfilled, isRejected } from './promise'

describe('promise guards', () => {
  const ok: PromiseSettledResult<number> = { status: 'fulfilled', value: 1 }
  const bad: PromiseSettledResult<number> = { status: 'rejected', reason: 'x' }

  it('isFulfilled narrows fulfilled results', () => {
    expect(isFulfilled(ok)).toBe(true)
    expect(isFulfilled(bad)).toBe(false)
  })
  it('isRejected narrows rejected results', () => {
    expect(isRejected(bad)).toBe(true)
    expect(isRejected(ok)).toBe(false)
  })
})
