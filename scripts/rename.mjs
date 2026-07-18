#!/usr/bin/env node
// One-shot rebrand for the G Stack template. Replaces the "Starter" display name
// across the app + email templates, sets the package name, and (optionally) the
// site URL. Run once after "Use this template":
//
//   node scripts/rename.mjs "My App" [--package my-app] [--site https://myapp.com]
//
// Brand color (main.css --color-brand-*), favicon.svg, and LICENSE are left for
// you to edit by hand — see SETUP.md.
import { readFileSync, writeFileSync } from 'node:fs'

const OLD_NAME = 'Starter'
const OLD_PKG = 'nuxt-supabase-starter'
const OLD_SITE = 'https://example.com'

const args = process.argv.slice(2)
const name = args.find((a) => !a.startsWith('--'))
if (!name) {
  console.error('Usage: node scripts/rename.mjs "My App" [--package my-app] [--site https://myapp.com]')
  process.exit(1)
}
const flag = (f) => {
  const i = args.indexOf(f)
  return i >= 0 ? args[i + 1] : undefined
}
const pkgName =
  flag('--package') ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const site = flag('--site')

// Files that carry the display name. Docs (README, docs/) are intentionally left
// for you to rewrite by hand — they're prose, not brand tokens.
const nameFiles = [
  'app/components/AppLogo.vue',
  'app/components/AuthShell.vue',
  'app/app.vue',
  'server/utils/notificationEmail.ts',
  'i18n/locales/en.json',
  'i18n/locales/sr.json',
  'supabase/templates/confirmation.html',
  'supabase/templates/recovery.html',
  'supabase/templates/invite.html',
  'supabase/config.toml',
]

const replaceIn = (file, from, to) => {
  const before = readFileSync(file, 'utf8')
  const after = before.replaceAll(from, to)
  if (after !== before) {
    writeFileSync(file, after)
    return true
  }
  return false
}

let changed = 0
for (const f of nameFiles) if (replaceIn(f, OLD_NAME, name)) changed++

// package.json name
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
pkg.name = pkgName
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')

// The Vercel ignore command keys off the release-please branch, which is named
// after the package.
replaceIn('vercel.json', OLD_PKG, pkgName)

if (site) replaceIn('app/components/AuthShell.vue', OLD_SITE, site)

console.log(`Renamed "${OLD_NAME}" -> "${name}" in ${changed} file(s); package -> "${pkgName}".`)
if (site) console.log(`Site URL -> ${site}`)
console.log('\nStill to do by hand (see SETUP.md):')
console.log('  - brand color: app/assets/css/main.css (--color-brand-*)')
console.log('  - favicon:     public/favicon.svg')
console.log('  - license:     LICENSE (copyright holder)')
console.log('  - readme:      README.md (product description)')
