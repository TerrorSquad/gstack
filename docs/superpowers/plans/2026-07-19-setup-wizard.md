# Setup Wizard (`pnpm setup`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `pnpm setup` CLI that reads an integration manifest, asks which flag-gated subsystems to enable, and writes correctly-stubbed `.env` — without deleting anything unpicked.

**Architecture:** One manifest (`scripts/integrations.ts`) is the single source of truth for every subsystem's flag + env vars. `setup.ts` consumes it to write `.env` via a pure `rewriteEnv()` function; `doctor.ts` is refactored to consume the same manifest to verify. Unpicked integrations go dormant (flag → `false`), never deleted.

**Tech Stack:** TypeScript, tsx, consola (prompts + logging), dotenv (parsing), vitest.

## Global Constraints

- Package manager is **pnpm** — never npm/yarn.
- Scripts run via **tsx** with `--env-file-if-exists=.env` (match `doctor` script line).
- No new dependencies — `consola` and `dotenv` are already present.
- Tests are `*.test.ts`, colocated with source, using `import { describe, expect, it } from 'vitest'`. Pure logic only — no DOM/Supabase/file I/O in the test.
- Never edit `nuxt.config.ts` `extends[]` and never install packages — subsystems are flag-gated, not extends-gated.
- Unpicked integrations: set flag `false`, **never touch their keys**.
- Existing `.env` values are never overwritten — only *missing* keys get stubbed.

---

### Task 1: Integration manifest

**Files:**
- Create: `scripts/integrations.ts`

**Interfaces:**
- Produces: `interface IntegrationVar { key: string; hint?: string }`; `interface Integration { id: string; label: string; category: 'core' | 'security' | 'growth' | 'billing' | 'observability'; flag?: string; required: IntegrationVar[]; optional?: IntegrationVar[] }`; `export const integrations: Integration[]`.

- [ ] **Step 1: Write the manifest**

Create `scripts/integrations.ts`. Entries mirror the current `doctor.ts` sections (read `scripts/doctor.ts` lines 30–95 to confirm each subsystem's exact keys/flags before writing).

```ts
// Single source of truth for every flag-gated subsystem's env shape.
// Consumed by scripts/setup.ts (writes .env) and scripts/doctor.ts (verifies).
export interface IntegrationVar {
  key: string
  hint?: string
}

export interface Integration {
  id: string
  label: string
  category: 'core' | 'security' | 'growth' | 'billing' | 'observability'
  /** Env flag that enables it. Absent = always-on core, no on/off toggle. */
  flag?: string
  /** Must be present when enabled (doctor fails if missing). */
  required: IntegrationVar[]
  /** Nice-to-have when enabled (doctor warns if missing). */
  optional?: IntegrationVar[]
}

export const integrations: Integration[] = [
  {
    id: 'supabase',
    label: 'Supabase (core — always on)',
    category: 'core',
    required: [
      { key: 'SUPABASE_URL' },
      { key: 'SUPABASE_KEY' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY' },
      { key: 'NUXT_SUPABASE_SECRET_KEY' },
    ],
  },
  {
    id: 'github-oauth',
    label: 'GitHub OAuth login',
    category: 'security',
    required: [
      { key: 'SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID' },
      { key: 'SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET' },
    ],
  },
  {
    id: 'google-oauth',
    label: 'Google OAuth login',
    category: 'security',
    required: [
      { key: 'SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID' },
      { key: 'SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET' },
    ],
  },
  {
    id: 'sentry',
    label: 'Sentry error tracking',
    category: 'observability',
    required: [{ key: 'NUXT_PUBLIC_SENTRY_DSN' }],
    optional: [{ key: 'SENTRY_AUTH_TOKEN', hint: 'enables source-map upload' }],
  },
  {
    id: 'betterstack',
    label: 'BetterStack log forwarding',
    category: 'observability',
    required: [
      { key: 'NUXT_BETTERSTACK_SOURCE_TOKEN' },
      { key: 'NUXT_BETTERSTACK_INGEST_URL' },
    ],
  },
  {
    id: 'notifications',
    label: 'Email notifications',
    category: 'growth',
    flag: 'NUXT_PUBLIC_NOTIFICATIONS_ENABLED',
    required: [
      { key: 'NUXT_RESEND_KEY', hint: 'Resend API key' },
      { key: 'NUXT_NOTIFICATION_WEBHOOK_SECRET', hint: 'Supabase DB webhook secret' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing (Polar)',
    category: 'billing',
    flag: 'NUXT_PUBLIC_BILLING_ENABLED',
    required: [
      { key: 'NUXT_POLAR_ACCESS_TOKEN' },
      { key: 'NUXT_POLAR_WEBHOOK_SECRET' },
    ],
    optional: [
      { key: 'NUXT_POLAR_PRICE_PRO', hint: 'price id for the Pro plan' },
      { key: 'NUXT_POLAR_PRICE_ENTERPRISE', hint: 'price id for the Enterprise plan' },
    ],
  },
]
```

- [ ] **Step 2: Typecheck the manifest**

Run: `pnpm exec tsc --noEmit scripts/integrations.ts`
Expected: no output (exit 0). (If tsc complains about module settings, skip — `nuxt typecheck` in CI covers it; the file is plain data with no imports.)

- [ ] **Step 3: Commit**

```bash
git add scripts/integrations.ts
git commit -m "feat(setup): integration manifest"
```

---

### Task 2: `rewriteEnv` pure function + test

**Files:**
- Create: `scripts/setup.ts` (only the `rewriteEnv` export + its helpers in this task)
- Create: `scripts/setup.test.ts`

**Interfaces:**
- Consumes: `Integration`, `integrations` from `./integrations` (Task 1).
- Produces: `export function rewriteEnv(envText: string, picks: Set<string>): string` — `picks` is the set of enabled integration `id`s. Returns the new `.env` text. Flips every flagged integration's flag to `true`/`false` by pick membership; appends missing required+optional keys (for picked integrations) as `KEY=` stubs under `# --- <category> ---` headers; preserves existing lines (order, comments, blanks, unknown keys, existing values) verbatim.

- [ ] **Step 1: Write the failing test**

Create `scripts/setup.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { rewriteEnv } from './setup'

describe('rewriteEnv', () => {
  it('flips picked flags on and unpicked flags off', () => {
    const input = [
      'NUXT_PUBLIC_BILLING_ENABLED=false',
      'NUXT_PUBLIC_NOTIFICATIONS_ENABLED=true',
    ].join('\n')
    const out = rewriteEnv(input, new Set(['billing']))
    expect(out).toContain('NUXT_PUBLIC_BILLING_ENABLED=true')
    expect(out).toContain('NUXT_PUBLIC_NOTIFICATIONS_ENABLED=false')
  })

  it('preserves existing unrelated keys, comments, and blank lines', () => {
    const input = ['# my notes', 'CUSTOM_KEY=keepme', '', 'SUPABASE_URL=http://x'].join('\n')
    const out = rewriteEnv(input, new Set())
    expect(out).toContain('# my notes')
    expect(out).toContain('CUSTOM_KEY=keepme')
    expect(out).toContain('SUPABASE_URL=http://x')
    expect(out).toMatch(/# my notes\nCUSTOM_KEY=keepme\n\n/) // order + blank preserved
  })

  it('appends missing required and optional keys as stubs with hints for picks', () => {
    const out = rewriteEnv('', new Set(['billing']))
    expect(out).toContain('NUXT_POLAR_ACCESS_TOKEN=')
    expect(out).toContain('NUXT_POLAR_PRICE_PRO= # price id for the Pro plan')
  })

  it('does not re-stub a key that is already present', () => {
    const input = 'NUXT_POLAR_ACCESS_TOKEN=already-set'
    const out = rewriteEnv(input, new Set(['billing']))
    const matches = out.match(/^NUXT_POLAR_ACCESS_TOKEN=/gm) ?? []
    expect(matches).toHaveLength(1)
    expect(out).toContain('NUXT_POLAR_ACCESS_TOKEN=already-set')
  })

  it('does not add keys for unpicked integrations', () => {
    const out = rewriteEnv('', new Set())
    expect(out).not.toContain('NUXT_POLAR_ACCESS_TOKEN')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run scripts/setup.test.ts`
Expected: FAIL — cannot import `rewriteEnv` (module/​export not found).

- [ ] **Step 3: Write minimal implementation**

Create `scripts/setup.ts` with just the pure function (the CLI shell comes in Task 3):

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run scripts/setup.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/setup.ts scripts/setup.test.ts
git commit -m "feat(setup): pure rewriteEnv function"
```

---

### Task 3: Wizard CLI shell

**Files:**
- Modify: `scripts/setup.ts` (add the `main()` CLI wrapper below `rewriteEnv`)
- Modify: `package.json:scripts` (add `setup` line)

**Interfaces:**
- Consumes: `rewriteEnv` (Task 2), `integrations` (Task 1).
- Produces: a runnable `pnpm setup`. No exported API beyond Task 2.

- [ ] **Step 1: Add the CLI wrapper to `scripts/setup.ts`**

Append below the `rewriteEnv` function:

```ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import { consola } from 'consola'

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

main().catch((e) => {
  consola.error(e)
  process.exit(1)
})
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `scripts` (alphabetically near `seed`):

```json
"setup": "tsx --env-file-if-exists=.env scripts/setup.ts",
```

- [ ] **Step 3: Verify the rewriteEnv test still passes**

The added imports/`main()` must not break the pure function or its test.
Run: `pnpm exec vitest run scripts/setup.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 4: Manually smoke the wizard against a throwaway env**

```bash
cp .env /tmp/env.bak 2>/dev/null; true
pnpm setup
```
Expected: a multiselect prompt appears pre-checked to match current flags; after selecting, `.env` is rewritten, flags flipped, missing keys stubbed, existing values untouched. Restore if needed: `git checkout .env 2>/dev/null || true`.

- [ ] **Step 5: Commit**

```bash
git add scripts/setup.ts package.json
git commit -m "feat(setup): pnpm setup wizard CLI"
```

---

### Task 4: Refactor `doctor.ts` onto the manifest

**Files:**
- Modify: `scripts/doctor.ts`

**Interfaces:**
- Consumes: `integrations` (Task 1).

- [ ] **Step 1: Replace the flag-gated sections with a manifest loop**

Read `scripts/doctor.ts` first. Replace the **Notifications** and **Billing** sections (the `on(flag)`-gated blocks, ~lines 58–86) with a single generic loop. Keep the bespoke sections that don't fit the generic shape unchanged: **Core** (no flag — iterate `integrations` where `!flag`), **Security/OAuth** half-configured pairing, **Sentry** DSN+token messaging, **BetterStack** both-or-neither, **Billing price-id** "nothing to sell" warning, and **Prod** `NUXT_SITE_URL`.

Add near the top, after the `env`/`has`/`on` helpers:

```ts
import { integrations } from './integrations'
```

Generic loop for flag-gated integrations (replaces the hand-written notifications + billing *presence* checks; the billing price-id warning stays as a bespoke line after it):

```ts
for (const it of integrations) {
  if (!it.flag) continue
  consola.log('')
  consola.info(it.label)
  if (!on(it.flag)) {
    info(`${it.id} off`)
    continue
  }
  for (const v of it.required) {
    if (has(v.key)) ok(v.key)
    else fail(`${it.label} ENABLED but ${v.key} missing`)
  }
  for (const v of it.optional ?? []) {
    if (has(v.key)) ok(v.key)
    else warn(`${v.key} unset${v.hint ? ` — ${v.hint}` : ''}`)
  }
}
```

Leave the bespoke billing price-id `warn` ("no price ids — checkout CTAs have nothing to sell") — note the generic `optional` loop already warns per-price-id, so **remove the now-duplicated bespoke price-id warning** to avoid double-reporting. Keep everything else (Core, OAuth, Sentry, BetterStack, Prod) as-is.

- [ ] **Step 2: Run doctor with no env — expect it still reports cleanly**

Run: `pnpm doctor`
Expected: runs without throwing; Core keys reported (fail if unset locally is fine), notifications/billing shown off or with their required-key fails. Exit code reflects missing required keys as before.

- [ ] **Step 3: Run doctor against a billing-enabled env to confirm the loop fires**

```bash
NUXT_PUBLIC_BILLING_ENABLED=true pnpm doctor; echo "exit=$?"
```
Expected: prints "Billing (Polar)" then fails on missing `NUXT_POLAR_ACCESS_TOKEN` / `NUXT_POLAR_WEBHOOK_SECRET` and warns on the two price ids; non-zero exit.

- [ ] **Step 4: Lint the changed script**

Run: `pnpm lint scripts/doctor.ts scripts/setup.ts scripts/integrations.ts`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/doctor.ts
git commit -m "refactor(doctor): consume integration manifest"
```

---

### Task 5: Document `pnpm setup`

**Files:**
- Modify: `CLAUDE.md` (the seeding/doctor area)
- Modify: `README.md` (if a setup/env section exists — otherwise skip)

**Interfaces:** none.

- [ ] **Step 1: Add a CLAUDE.md note**

Under the section that mentions `pnpm doctor` (or add near "Seeding"), add:

```markdown
## Setup wizard

`pnpm setup` reads `scripts/integrations.ts` (the subsystem manifest) and writes
`.env`: it flips the flag for each subsystem you pick and stubs any missing keys.
Unpicked subsystems are set to `false`, never deleted. It writes; `pnpm doctor`
verifies. Both scripts share the one manifest — add a subsystem there and both
pick it up.
```

- [ ] **Step 2: Add a README line if a setup section exists**

If `README.md` has a getting-started / env section, add one line: "Run `pnpm setup` to choose which integrations to enable and stub their env vars." If no such section, skip this step.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: document pnpm setup wizard"
```

---

## Self-Review Notes

- **Spec coverage:** manifest (Task 1), wizard flow + prompt + dormant-not-deleted (Tasks 2–3), pure `rewriteEnv` + its 5 assertions (Task 2), doctor refactor incl. bespoke special cases retained (Task 4), package.json + docs (Tasks 3, 5). All spec §Components and §Files-touched map to a task.
- **No new deps:** consola + dotenv already present; dotenv not actually needed since `rewriteEnv` parses lines itself (kept parsing inline — simpler than pulling dotenv for a flag flip). Spec mentioned dotenv as *available*; not using it is within scope.
- **Type consistency:** `rewriteEnv(envText: string, picks: Set<string>)` and the `Integration`/`IntegrationVar` shapes are identical across Tasks 1–4.
- **Ambiguity resolved:** billing price-id double-warning — the generic `optional` loop supersedes the old bespoke price-id warning; Task 4 Step 1 explicitly removes the duplicate.
