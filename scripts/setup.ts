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
