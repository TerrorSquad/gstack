import { describe, expect, it } from 'vitest'

import { scrubSentryEvent } from './scrubSentryEvent'

describe('scrubSentryEvent', () => {
  it('drops bodies, cookies, query and credential headers, keeps the rest', () => {
    const e = scrubSentryEvent({
      type: undefined,
      request: {
        url: '/api/x',
        data: { password: 'p' },
        cookies: { sb: 't' },
        query_string: 'token=1',
        headers: { Authorization: 'Bearer t', apikey: 'k', 'user-agent': 'ua' },
      },
    })
    expect(e.request).toEqual({ url: '/api/x', headers: { 'user-agent': 'ua' } })
  })
})
