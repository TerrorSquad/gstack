#!/usr/bin/env node
/**
 * i18n checks. Two modes, one file:
 *
 *   (default)  for every locale file in i18n/locales/*.json: valid JSON, no
 *              duplicate keys, and key parity with the reference locale (`sr`).
 *              Run: pnpm lint:i18n
 *
 *   --keys     every i18n key used in a .vue template exists in a locale file
 *              (via vue-i18n-extract). Unused-key detection is intentionally
 *              not enforced: this codebase builds many keys dynamically
 *              (`common.leaveType.${type}`), which the tool can't resolve, so
 *              its unused-key report is mostly false positives.
 *              Run: pnpm lint:i18n-keys
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const REFERENCE = 'sr' // default locale; all others must match its key set
const dir = resolve(fileURLToPath(new URL('.', import.meta.url)), '../i18n/locales')

/** Parse a locale file: validate JSON, return its keys, report duplicates. */
function readLocale(file: string, onFail: () => void): string[] {
  const raw = readFileSync(resolve(dir, file), 'utf-8')

  try {
    JSON.parse(raw) // throws on malformed JSON
  } catch (err) {
    console.error(`❌ ${file} - invalid JSON: ${err instanceof Error ? err.message : String(err)}`)
    onFail()
    return []
  }

  const keys = [...raw.matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1])
  const seen = new Set<string>()
  const dupes = keys.filter((k) => (seen.has(k) ? true : (seen.add(k), false)))

  if (dupes.length > 0) {
    console.error(`❌ ${file} - ${dupes.length} duplicate key(s): ${dupes.join(', ')}`)
    onFail()
  } else {
    console.log(`✅ ${file} - valid, ${seen.size} keys`)
  }

  return [...seen]
}

function checkParity(): boolean {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .toSorted()

  if (files.length === 0) {
    console.error(`❌ no locale files found in ${dir}`)
    return true
  }

  let failed = false
  const onFail = () => {
    failed = true
  }
  const localeKeys = new Map(files.map((file) => [file, readLocale(file, onFail)]))

  const refFile = `${REFERENCE}.json`
  const refKeys = localeKeys.get(refFile)
  if (!refKeys) {
    console.error(`❌ reference locale ${refFile} not found`)
    return true
  }
  const refSet = new Set(refKeys)

  for (const [file, keys] of localeKeys) {
    if (file === refFile) continue
    const set = new Set(keys)
    const missing = refKeys.filter((k) => !set.has(k))
    const extra = keys.filter((k) => !refSet.has(k))

    if (missing.length > 0) {
      console.error(
        `❌ ${file} - ${missing.length} key(s) missing vs ${refFile}: ${missing.join(', ')}`,
      )
      failed = true
    }
    if (extra.length > 0) {
      console.error(`❌ ${file} - ${extra.length} key(s) not in ${refFile}: ${extra.join(', ')}`)
      failed = true
    }
    if (missing.length === 0 && extra.length === 0) {
      console.log(`✅ ${file} - in parity with ${refFile}`)
    }
  }

  return failed
}

function checkKeys(): boolean {
  const outFile = join(mkdtempSync(join(tmpdir(), 'i18n-report-')), 'report.json')

  execFileSync('pnpm', [
    'exec',
    'vue-i18n-extract',
    'report',
    '--vueFiles',
    './app/**/*.vue',
    '--languageFiles',
    './i18n/locales/*.json',
    '--output',
    outFile,
  ])

  const { missingKeys } = JSON.parse(readFileSync(outFile, 'utf-8')) as {
    missingKeys: { path: string; file: string; line: number; language: string }[]
  }
  rmSync(join(outFile, '..'), { recursive: true, force: true })

  // vue-i18n-extract can't resolve template-literal keys (`${...}`); skip them.
  const real = missingKeys.filter((k) => !k.path.includes('${'))

  if (real.length > 0) {
    console.error(`❌ ${real.length} i18n key(s) used but missing from a locale file:`)
    for (const k of real) {
      console.error(`   '${k.path}' - ${k.file}:${k.line} (${k.language})`)
    }
    return true
  }

  console.log('✅ no missing i18n keys')
  return false
}

const failed = process.argv.includes('--keys') ? checkKeys() : checkParity()
process.exit(failed ? 1 : 0)
