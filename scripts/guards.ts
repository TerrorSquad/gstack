// Static guards against mistakes already made once (here or in an app built on this starter). Runs on pre-commit
// (forge.toml) and as `pnpm lint:guards`. Each check names the incident it prevents; add one whenever a new class of
// bug slips through.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'vue/compiler-sfc'

const fails: string[] = []
const fail = (msg: string) => fails.push(msg)
const read = (p: string) => readFileSync(p, 'utf8')

function files(dir: string, exts: string[], out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.nuxt', '.output', 'dist'].includes(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) files(p, exts, out)
    else if (exts.some((e) => p.endsWith(e))) out.push(p)
  }
  return out
}
const source = [...files('app', ['.vue', '.ts']), ...files('layers', ['.vue', '.ts'])].filter(
  (p) => !p.endsWith('.test.ts'),
)

// 1. Plain 'sr' is Serbian *Cyrillic* to Intl: month names came out "нов, дец" on a Latin page.
const INTL = /Intl\.\w+\(|toLocale(Date|Time)?String\(|format(Money|Number|Percent|Currency)\(/
for (const p of source) {
  if (p.endsWith('formatNumber.ts')) continue
  read(p)
    .split('\n')
    .forEach((line, i) => {
      if (
        INTL.test(line) &&
        /(?<![\w.])locale(\.value)?\b(?!\w)/.test(line) &&
        !line.includes('intlLocale(')
      )
        fail(
          `${p}:${i + 1}: pass intlLocale(locale) to Intl/toLocale*/format*, not the i18n code (sr → Cyrillic)`,
        )
    })
}

// 2. A message that looks like HTML ("<module>.view") makes vue-i18n refuse the whole locale file: every
//    string on every page showed as its raw key.
for (const l of ['en', 'sr']) {
  for (const [k, v] of Object.entries(
    JSON.parse(read(`i18n/locales/${l}.json`)) as Record<string, string>,
  )) {
    if (/<\/?[a-zA-Z][^>]*>/.test(v))
      fail(`i18n/locales/${l}.json ${k}: looks like HTML, vue-i18n rejects the file`)
  }
}

// 3. `vercel link` appended `.env*` to .gitignore, which would have untracked .env.example.
try {
  execFileSync('git', ['check-ignore', '-q', '--no-index', '.env.example'])
  fail('.gitignore ignores .env.example (a broad `.env*` line?)')
} catch {} // exit 1 = not ignored: good

// 4. CLI deploys upload the working tree: local env files must never go with it.
const vercelIgnore = existsSync('.vercelignore') ? read('.vercelignore') : ''
for (const must of ['.env*'])
  if (!vercelIgnore.split('\n').includes(must)) fail(`.vercelignore must list ${must}`)

// 5. `supabase projects api-keys` masks secret keys unless --reveal: Vercel got a placeholder and every DB call failed.
for (const p of files('scripts', ['.ts', '.mjs'])) {
  const s = read(p)
  if (s.includes("'api-keys'") && !s.includes("'--reveal'"))
    fail(`${p}: supabase projects api-keys needs --reveal (secret keys come back masked)`)
}

// 6. A migration dated before one already applied is refused by `supabase db push` (production stalls until
//    --include-all): a new migration must sort after every committed one.
{
  const committed = execFileSync(
    'git',
    ['ls-tree', '--name-only', 'HEAD', 'supabase/migrations/'],
    { encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean)
    .toSorted()
  const latest = committed.at(-1) ?? ''
  const added = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=A', '--', 'supabase/migrations/'],
    { encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean)
  for (const m of added)
    if (m < latest) fail(`${m}: dated before ${latest}; rename it to a later timestamp`)
}

// 7. The formatter (semi: false) rewrote `@click="a; b"` onto two lines without the `;`. Vue only treats a handler
//     as statements when it contains one, so a layout stopped compiling and every page 500'd in dev.
for (const p of files('.', ['.vue']))
  for (const e of parse(read(p), { filename: p }).errors)
    fail(
      `${p}:${'loc' in e ? e.loc?.start.line : ''}: ${e.message} (two statements in a handler: \`() => { a; b }\`)`,
    )

// 8. The formatter assumes HTML whitespace and moved `</span> <span>` onto two lines; Vue drops a whitespace-only gap
//     between elements once it holds a newline, so "0.00 RSD" read "0.00RSD". A staged .vue file that trades a
//     same-line gap for a line-break gap gets flagged: keep the space with a margin class (ms-1) or {{ ' ' }}.
{
  const gaps = (src: string) => {
    const n = { space: 0, newline: 0 }
    const walk = (node: {
      type: number
      content?: string
      loc: { source: string }
      children?: unknown[]
    }) => {
      const c = (node.children ?? []) as (typeof node)[]
      for (let i = 1; i + 1 < c.length; i++)
        if (
          c[i]!.type === 2 &&
          !c[i]!.content!.trim() &&
          c[i - 1]!.type === 1 &&
          c[i + 1]!.type === 1
        )
          n[c[i]!.loc.source.includes('\n') ? 'newline' : 'space']++
      c.forEach(walk)
    }
    const ast = parse(src, { templateParseOptions: { whitespace: 'preserve' } }).descriptor.template
      ?.ast
    if (ast) walk(ast as never)
    return n
  }
  const staged = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=M', '--', '*.vue'],
    { encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean)
  for (const f of staged) {
    const before = gaps(execFileSync('git', ['show', `HEAD:${f}`], { encoding: 'utf8' }))
    const after = gaps(execFileSync('git', ['show', `:${f}`], { encoding: 'utf8' }))
    if (after.space < before.space && after.newline > before.newline)
      fail(
        `${f}: a space between two elements went onto its own line, and Vue drops it there (use ms-1 or {{ ' ' }})`,
      )
  }
}

if (fails.length) {
  console.error(`✗ ${fails.length} guard(s) failed:\n  ${fails.join('\n  ')}`)
  process.exit(1)
}
console.info('✅ guards ok')
