import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import { consola } from 'consola'

import { integrations } from './integrations'

// Pure .env rewriter. `picks` = set of enabled integration ids.
// Preserves existing lines verbatim; only flips known flags and appends
// missing keys for picked integrations. Never overwrites an existing value.
export function rewriteEnv(envText: string, picks: Set<string>): string {
  const lines = envText.split('\n')
  const present = new Set<string>()
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=/)
    if (m) present.add(m[1])
  }

  // Map every known flag to its desired value (true if picked, false otherwise).
  const flagValue = new Map<string, boolean>()
  for (const it of integrations) {
    if (it.flag) flagValue.set(it.flag, picks.has(it.id))
  }

  // Pass 1: flip flags in place, preserve everything else.
  const rewritten = lines.map((line) => {
    const m = line.match(/^(\s*)([A-Z0-9_]+)(\s*=).*$/)
    if (!m) return line
    const [, indent, key, eq] = m
    if (flagValue.has(key)) return `${indent}${key}${eq}${flagValue.get(key)}`
    return line
  })

  // Pass 2: append missing keys for picked integrations, grouped by category.
  const additions: string[] = []
  const byCategory = new Map<string, string[]>()
  for (const it of integrations) {
    if (it.flag && !picks.has(it.id)) continue // unpicked flagged → dormant, no keys
    for (const v of [...it.required, ...(it.optional ?? [])]) {
      if (present.has(v.key)) continue
      present.add(v.key)
      const stub = v.hint ? `${v.key}= # ${v.hint}` : `${v.key}=`
      const bucket = byCategory.get(it.category) ?? []
      bucket.push(stub)
      byCategory.set(it.category, bucket)
    }
  }
  for (const [category, stubs] of byCategory) {
    additions.push('', `# --- ${category} ---`, ...stubs)
  }

  const body = rewritten.join('\n')
  return additions.length ? `${body}${body.endsWith('\n') ? '' : '\n'}${additions.join('\n')}\n` : body
}

const ENV_PATH = '.env'

async function main() {
  const envText = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : ''

  const flagged = integrations.filter((it) => it.flag)
  const enabled = new Set(
    flagged.filter((it) => new RegExp(`^${it.flag}\\s*=\\s*true`, 'm').test(envText)).map((it) => it.id),
  )

  consola.info('Pick the subsystems to enable. Supabase core is always on.')
  const picks = (await consola.prompt('Enable which subsystems?', {
    type: 'multiselect',
    required: false,
    options: flagged.map((it) => ({
      label: `${it.label}  (${it.category})`,
      value: it.id,
      selected: enabled.has(it.id),
    })),
  })) as string[]

  // consola returns undefined on Ctrl-C — bail without writing.
  if (!Array.isArray(picks)) {
    consola.warn('Cancelled — .env not modified.')
    return
  }

  const next = rewriteEnv(envText, new Set(picks))
  writeFileSync(ENV_PATH, next)

  consola.success(`Wrote ${ENV_PATH}. Enabled: ${picks.length ? picks.join(', ') : '(none)'}.`)
  consola.info('Fill in the stubbed blanks, then run `pnpm doctor` to verify.')
}

// Only run the CLI when executed directly (`pnpm setup`), not when imported by
// the test. import.meta.main is set by tsx/Node for the entry module.
if (import.meta.main) {
  main().catch((e) => {
    consola.error(e)
    process.exit(1)
  })
}
