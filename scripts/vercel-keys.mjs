// Copies the hosted Supabase API keys into the linked Vercel project without printing them.
// Usage: node scripts/vercel-keys.mjs <project-ref>
import { execFileSync } from 'node:child_process'

const ref = process.argv[2]
if (!ref) throw new Error('usage: node scripts/vercel-keys.mjs <project-ref>')

const keys = JSON.parse(
  execFileSync(
    'pnpm',
    ['-s', 'supabase', 'projects', 'api-keys', '--project-ref', ref, '--reveal', '-o', 'json'],
    { encoding: 'utf8' },
  ),
)
const find = (type, legacy) =>
  (keys.find((k) => k.type === type) ?? keys.find((k) => k.name === legacy))?.api_key
const vars = {
  SUPABASE_KEY: find('publishable', 'anon'),
  SUPABASE_SECRET_KEY: find('secret', 'service_role'),
}

for (const [name, value] of Object.entries(vars)) {
  if (!value) throw new Error(`no ${name} key found for ${ref}`)
  for (const env of ['production', 'preview']) {
    try {
      execFileSync('pnpm', ['-s', 'dlx', 'vercel', 'env', 'rm', name, env, '--yes'], {
        stdio: 'ignore',
      })
    } catch {}
    execFileSync('pnpm', ['-s', 'dlx', 'vercel', 'env', 'add', name, env], {
      input: value,
      stdio: ['pipe', 'ignore', 'inherit'],
    })
    console.log(`set ${name} (${env})`)
  }
}
