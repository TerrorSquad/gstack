import { describe, expect, it } from 'vitest'

import { hit } from './rateLimit'

// Each test uses its own keys, so the module-level window map doesn't leak
// between them - no reset hook needed.
describe('rateLimit hit()', () => {
  it('allows up to the limit, then blocks', () => {
    const opts = { limit: 3, windowMs: 1000 }
    expect(hit('a', opts, 0)).toEqual({ ok: true }) // 1
    expect(hit('a', opts, 0)).toEqual({ ok: true }) // 2
    expect(hit('a', opts, 0)).toEqual({ ok: true }) // 3
    expect(hit('a', opts, 0)).toEqual({ ok: false, retryAfter: 1 }) // 4 -> over
  })

  it('resets after the window elapses', () => {
    const opts = { limit: 1, windowMs: 1000 }
    expect(hit('b', opts, 0)).toEqual({ ok: true })
    expect(hit('b', opts, 500)).toEqual({ ok: false, retryAfter: 1 }) // same window
    expect(hit('b', opts, 1000)).toEqual({ ok: true }) // window rolled over
  })

  it('tracks keys independently', () => {
    const opts = { limit: 1, windowMs: 1000 }
    expect(hit('x', opts, 0)).toEqual({ ok: true })
    expect(hit('y', opts, 0)).toEqual({ ok: true }) // different key, own budget
    expect(hit('x', opts, 0)).toEqual({ ok: false, retryAfter: 1 })
  })
})
