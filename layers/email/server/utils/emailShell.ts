/**
 * The one HTML shell every transactional email renders into.
 *
 * Deliberately dependency-free and alias-free (no `#shared`, no .vue): it is
 * imported both by Nitro at runtime and by `scripts/gen-auth-templates.ts` under
 * plain tsx, and a Nuxt alias would resolve in the first case but not the second.
 *
 * Auth mail (confirm / recover / invite) is rendered by GoTrue, not by us, so it
 * has to exist as standalone files in supabase/templates/. Hand-maintaining a
 * second copy of the shell is how those files ended up indigo (#4f46e5) while
 * the app's own mail was emerald (#059669) and the actual brand token was violet
 * — three palettes for one product. One shell, generated.
 */

/**
 * Email clients strip CSS custom properties, so the brand palette can't be
 * `var(--color-brand-600)` here — it's inlined. Keep in sync with
 * `layers/ui/app/assets/css/main.css` by hand; there is one value to change.
 */
export const EMAIL_BRAND = {
  accent: '#b45309', // --color-brand-700 (the AA-safe fill step for amber)
  accentSoft: '#fffbeb', // --color-brand-50
  page: '#f1f5f9',
  surface: '#ffffff',
  border: '#e2e8f0',
  heading: '#0f172a',
  body: '#475569',
  muted: '#94a3b8',
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const

export interface EmailShellOptions {
  /** Single glyph in the circular badge above the heading. */
  icon: string
  heading: string
  paragraphs: string[]
  cta: { label: string; url: string }
  footnote: string
  /** Brand wordmark. Parameterised so scripts/rename.mjs has one place to hit. */
  brand?: string
}

/**
 * `&` in an href must be written `&amp;` — the parser decodes it before the URL
 * is dereferenced, so the link still resolves with a real `&`. GoTrue's
 * `{{ .Thing }}` placeholders contain no `&` and pass through untouched.
 */
const escapeAttr = (url: string) => url.replaceAll('&', '&amp;')

export function emailBase({ icon, heading, paragraphs, cta, footnote, brand = 'GStack' }: EmailShellOptions): string {
  const body = paragraphs
    .map((p) => `                <p style="margin: 0 0 8px; color: ${EMAIL_BRAND.body}; font-size: 14px">\n                  ${p}\n                </p>`)
    .join('\n')

  return `<!doctype html>
<html lang="en">
  <body
    style="margin: 0; padding: 0; background: ${EMAIL_BRAND.page}; font-family: ${EMAIL_BRAND.font}; color: ${EMAIL_BRAND.heading}"
  >
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${EMAIL_BRAND.page}; padding: 24px 0">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; background: ${EMAIL_BRAND.surface}; border: 1px solid ${EMAIL_BRAND.border}; border-radius: 16px">
            <tr>
              <td style="padding: 24px 32px; text-align: center">
                <span style="color: ${EMAIL_BRAND.accent}; font-weight: 700; font-size: 18px">${brand}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px; text-align: center">
                <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: ${EMAIL_BRAND.accentSoft}; color: ${EMAIL_BRAND.accent}; font-size: 26px">${icon}</div>
                <h1 style="margin: 16px 0 8px; font-size: 20px; color: ${EMAIL_BRAND.heading}">${heading}</h1>
${body}
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px; text-align: center">
                <a href="${escapeAttr(cta.url)}" style="display: inline-block; background: ${EMAIL_BRAND.accent}; color: ${EMAIL_BRAND.surface}; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px">${cta.label}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 24px; text-align: center">
                <span style="color: ${EMAIL_BRAND.accent}; font-weight: 700; font-size: 14px">${brand}</span>
                <p style="margin: 6px 0 0; color: ${EMAIL_BRAND.muted}; font-size: 11px">${footnote}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}
