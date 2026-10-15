// Pre-commit guard (forge.toml `db-types`): when a migration is staged, regenerate the typed DB client so a new
// table/function/column is known to `nuxt typecheck` (otherwise only pre-push would catch it).
//
// stdout is captured and written here rather than `… > file`: a shell redirect truncates the file before the command
// runs, so a failed gen (local Supabase not running) would blank the types. A failure leaves the file alone and only
// warns — it never blocks the commit; `pnpm db:types` does the same by hand.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const OUT = 'shared/types/database.types.ts'

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
  writeFileSync(OUT, types)
  execFileSync('git', ['add', OUT])
  console.log(`Regenerated ${OUT} from the local schema`)
} catch {
  console.warn(
    `⚠ A migration changed but ${OUT} could not be regenerated (is local Supabase running? \`pnpm supabase start\`).\n  Apply the migration locally and run \`pnpm db:types\` before pushing, or \`nuxt typecheck\` fails.`,
  )
}
