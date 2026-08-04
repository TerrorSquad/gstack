import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { AUTH_TEMPLATE_SPECS, renderAuthTemplate } from '../../../../scripts/gen-auth-templates'
import { emailBase, EMAIL_BRAND } from './emailShell'

const names = Object.keys(AUTH_TEMPLATE_SPECS) as (keyof typeof AUTH_TEMPLATE_SPECS)[]

describe('auth templates', () => {
  // The whole point of the generator: supabase/templates/*.html is output, not
  // source. If someone hand-edits the HTML (or moves the brand color and forgets
  // to regenerate), this fails on pre-commit instead of shipping a mismatched
  // password-reset email.
  it.each(names)('supabase/templates/%s.html matches the generator', (name) => {
    const committed = readFileSync(`supabase/templates/${name}.html`, 'utf8')
    expect(committed).toBe(renderAuthTemplate(name))
  })

  it('escapes & in the CTA url so the href parses', () => {
    // recovery's url carries a query string; a raw & would truncate the link.
    expect(renderAuthTemplate('recovery')).toContain('&amp;type=recovery')
  })

  it('keeps GoTrue placeholders intact', () => {
    expect(renderAuthTemplate('confirmation')).toContain('{{ .ConfirmationURL }}')
  })
})

describe('emailBase', () => {
  const opts = {
    icon: '✓',
    heading: 'Hello',
    paragraphs: ['One.', 'Two.'],
    cta: { label: 'Go', url: 'https://example.com' },
    footnote: 'Ignore me.',
  }

  it('renders every section and both paragraphs', () => {
    const html = emailBase(opts)
    expect(html).toContain('Hello')
    expect(html).toContain('One.')
    expect(html).toContain('Two.')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('Ignore me.')
    expect(html).toContain(EMAIL_BRAND.accent)
  })

  it('defaults the wordmark to GStack but accepts an override', () => {
    expect(emailBase(opts)).toContain('>GStack<')
    expect(emailBase({ ...opts, brand: 'Acme' })).toContain('>Acme<')
  })
})
