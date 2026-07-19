export interface ChangelogHighlight {
  kind: 'feature' | 'fix'
  text: string
}

export interface ChangelogEntry {
  date: string // ISO YYYY-MM-DD
  title: string
  highlights: ChangelogHighlight[]
}

const feature = (text: string): ChangelogHighlight => ({ kind: 'feature', text })
const fix = (text: string): ChangelogHighlight => ({ kind: 'fix', text })

// Hand-curated, user-facing "What's new" feed rendered at /changelog. No version
// numbers (those live in CHANGELOG.md for developers). One entry per date, newest
// first — fold multiple same-day highlights into a single entry. Write in plain
// user language, not commit-speak. See the `changelog` skill.
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-07-19',
    title: 'Roadmap & a fresh look',
    highlights: [
      feature('A public roadmap so you can see what we’re building next.'),
      feature('The changelog is now a cleaner, easier-to-scan timeline.'),
      feature('Refreshed look with a new accent colour and softer, rounder UI.'),
      feature('Send us feedback right from the app with the new feedback button.'),
    ],
  },
  {
    date: '2026-07-12',
    title: 'Sign in your way',
    highlights: [
      feature('Continue with Google or GitHub — one click, no new password.'),
      feature('Forgot your password? Reset it straight from the sign-in page.'),
      fix('Sign-in no longer occasionally bounced you back to the login screen.'),
    ],
  },
  {
    date: '2026-07-05',
    title: 'Bring your team',
    highlights: [
      feature('Admins can now invite teammates by email and set their role.'),
      feature('Invited members land directly in your workspace.'),
    ],
  },
  {
    date: '2026-06-28',
    title: 'Plans & billing',
    highlights: [
      feature('Upgrade to Pro or Enterprise through secure checkout.'),
      feature('Manage your subscription, invoices and payment method from the billing portal.'),
    ],
  },
  {
    date: '2026-06-20',
    title: 'Stay in the loop',
    highlights: [
      feature('A notification bell keeps you up to date inside the app.'),
      feature('Optional email alerts so nothing slips through.'),
    ],
  },
  {
    date: '2026-06-14',
    title: 'Your account, your control',
    highlights: [
      feature('Upload an avatar and update your name, email and password.'),
      feature('Permanently delete your account and data whenever you want.'),
      fix('Profile changes now save reliably the first time.'),
    ],
  },
  {
    date: '2026-06-07',
    title: 'Dark mode & Srpski',
    highlights: [
      feature('A full dark theme — toggle it any time.'),
      feature('The whole app is now available in Serbian.'),
      fix('Fixed a few spots where text was hard to read on light backgrounds.'),
    ],
  },
  {
    date: '2026-05-30',
    title: 'Initial release',
    highlights: [
      feature('Multi-tenant workspaces with secure sign-up.'),
      feature('Notes to help you get started right away.'),
    ],
  },
]
