import { describe, expect, it } from 'vitest'

import { rewriteEnv } from './setup'

describe('rewriteEnv', () => {
  it('flips picked flags on and unpicked flags off', () => {
    const input = [
      'NUXT_PUBLIC_BILLING_ENABLED=false',
      'NUXT_PUBLIC_NOTIFICATIONS_ENABLED=true',
    ].join('\n')
    const out = rewriteEnv(input, new Set(['billing']))
    expect(out).toContain('NUXT_PUBLIC_BILLING_ENABLED=true')
    expect(out).toContain('NUXT_PUBLIC_NOTIFICATIONS_ENABLED=false')
  })

  it('preserves existing unrelated keys, comments, and blank lines', () => {
    const input = ['# my notes', 'CUSTOM_KEY=keepme', '', 'SUPABASE_URL=http://x'].join('\n')
    const out = rewriteEnv(input, new Set())
    expect(out).toContain('# my notes')
    expect(out).toContain('CUSTOM_KEY=keepme')
    expect(out).toContain('SUPABASE_URL=http://x')
    expect(out).toMatch(/# my notes\nCUSTOM_KEY=keepme\n\n/) // order + blank preserved
  })

  it('appends missing required and optional keys as stubs with hints for picks', () => {
    const out = rewriteEnv('', new Set(['billing']))
    expect(out).toContain('NUXT_POLAR_ACCESS_TOKEN=')
    expect(out).toContain('NUXT_POLAR_PRICE_PRO= # price id for the Pro plan')
  })

  it('does not re-stub a key that is already present', () => {
    const input = 'NUXT_POLAR_ACCESS_TOKEN=already-set'
    const out = rewriteEnv(input, new Set(['billing']))
    const matches = out.match(/^NUXT_POLAR_ACCESS_TOKEN=/gm) ?? []
    expect(matches).toHaveLength(1)
    expect(out).toContain('NUXT_POLAR_ACCESS_TOKEN=already-set')
  })

  it('does not add keys for unpicked integrations', () => {
    const out = rewriteEnv('', new Set())
    expect(out).not.toContain('NUXT_POLAR_ACCESS_TOKEN')
  })
})
