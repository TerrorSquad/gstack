// Pre-commit guard (forge.toml `db-types`): when a migration is staged, regenerate the typed DB client so a new
// table/function/column is known to `nuxt typecheck` (otherwise only pre-push would catch it).
//
// stdout is captured and written here rather than `… > file`: a shell redirect truncates the file before the command
// runs, so a failed gen (local Supabase not running) would blank the types. A failure leaves the file alone and only
// warns — it never blocks the commit; `pnpm db:types` does the same by hand.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const OUT = 'shared/types/database.types.ts'
// table names in a generated file (either key style: `notes: {` or `"notes": {`, followed by its Row)
const tables = (src) =>
  new Set([...src.matchAll(/"?([a-z_]\w*)"?: \{\s*\n\s+Row: /g)].map((m) => m[1]))

try {
  const types = execFileSync(
    'pnpm',
    ['exec', 'supabase', 'gen', 'types', 'typescript', '--local', '--schema', 'public'],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    },
  )
  if (!types.includes('export type Database'))
    throw new Error('unexpected output from supabase gen types')
  // Another project's local Supabase on the same port answered once, and its schema was committed as ours. A schema
  // that keeps under half of today's tables is not this project's: refuse it (a real mass drop: `pnpm db:types`).
  const before = existsSync(OUT) ? tables(readFileSync(OUT, 'utf8')) : new Set()
  const after = tables(types)
  const kept = [...before].filter((t) => after.has(t)).length
  if (before.size >= 3 && kept < before.size / 2) {
    console.warn(
      `⚠ ${OUT} NOT regenerated: the local database has ${kept} of this project's ${before.size} tables — another project's Supabase on that port?`,
    )
    process.exit(0)
  }
  writeFileSync(OUT, types)
  execFileSync('git', ['add', OUT])
  console.log(`Regenerated ${OUT} from the local schema`)
} catch {
  console.warn(
    `⚠ A migration changed but ${OUT} could not be regenerated (is local Supabase running? \`pnpm supabase start\`).\n  Apply the migration locally and run \`pnpm db:types\` before pushing, or \`nuxt typecheck\` fails.`,
  )
}
