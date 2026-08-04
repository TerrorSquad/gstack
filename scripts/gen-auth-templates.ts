/**
 * Generates supabase/templates/*.html from the same emailBase() the app's own
 * transactional mail uses.
 *
 *   pnpm gen:auth-templates
 *
 * Auth mail is rendered by GoTrue, not by the app, so these have to exist as
 * standalone files — but they are output, not source. Edit the specs below (or
 * emailShell.ts) and regenerate; don't hand-edit the HTML.
 *
 * There is no --check flag: emailShell.test.ts compares each committed file
 * against the generator directly, so drift is a failing unit test on pre-commit
 * rather than a mode of this script that nothing remembers to run.
 *
 * The {{ .Thing }} placeholders are Go template syntax that GoTrue substitutes.
 */
import { writeFile } from 'node:fs/promises'

import { emailBase, type EmailShellOptions } from '../layers/email/server/utils/emailShell'

export const AUTH_TEMPLATE_SPECS = {
  confirmation: {
    icon: '✓',
    heading: 'Confirm your email',
    paragraphs: [
      'Welcome to GStack. Confirm your email address to secure your account and finish signing up.',
    ],
    cta: { label: 'Confirm email', url: '{{ .ConfirmationURL }}' },
    footnote: "If you didn't create an account, you can ignore this email.",
  },
  recovery: {
    icon: '🔒',
    heading: 'Reset your password',
    paragraphs: [
      'We received a request to reset the password for your GStack account. Click below to choose a new one. This link works once and expires soon.',
    ],
    cta: {
      label: 'Set new password',
      url: '{{ .SiteURL }}/auth/set-password?token_hash={{ .TokenHash }}&type=recovery',
    },
    footnote: "If you didn't request this, you can safely ignore this email.",
  },
  invite: {
    icon: '✉',
    heading: "You've been invited",
    paragraphs: [
      "You've been invited to join GStack. Accept the invitation below to set your password and get started.",
    ],
    cta: { label: 'Accept invitation', url: '{{ .ConfirmationURL }}' },
    footnote: "If you weren't expecting this invitation, you can ignore this email.",
  },
} satisfies Record<string, EmailShellOptions>

export const renderAuthTemplate = (name: keyof typeof AUTH_TEMPLATE_SPECS) =>
  emailBase(AUTH_TEMPLATE_SPECS[name])

// Only write files when run directly, so the test can import the specs.
if (process.argv[1]?.endsWith('gen-auth-templates.ts')) {
  await Promise.all(
    Object.keys(AUTH_TEMPLATE_SPECS).map(async (name) => {
      const path = `supabase/templates/${name}.html`
      await writeFile(path, renderAuthTemplate(name as keyof typeof AUTH_TEMPLATE_SPECS))
      console.log(`wrote ${path}`)
    }),
  )
}
