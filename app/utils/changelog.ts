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
// Part of the entry-authoring API — use for bug-fix highlights: `fix('…')`.
// eslint-disable-next-line no-unused-vars
const fix = (text: string): ChangelogHighlight => ({ kind: 'fix', text })

// Hand-curated, user-facing "What's new" feed rendered at /changelog. No version
// numbers (those live in CHANGELOG.md for developers). One entry per date, newest
// first — fold multiple same-day highlights into a single entry. Write in plain
// user language, not commit-speak. See the `changelog` skill.
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-07-19',
    title: 'Initial release',
    highlights: [feature('First release.'), feature('Public roadmap at /roadmap.')],
  },
]
