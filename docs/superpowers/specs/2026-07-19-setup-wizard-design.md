# Setup wizard (`pnpm setup`) — design

**Date:** 2026-07-19
**Status:** approved, ready for planning
**Scope:** the wizard + integration manifest only. New integrations (Stripe/
LemonSqueezy, PostHog, Vue Email, support widget) are deliberately out of scope —
each becomes a follow-on spec that adds a manifest entry + a dormant layer.

## Problem

The starter ships every subsystem as a dormant, flag-gated layer (billing,
notifications, observability, OAuth, …). Turning one on today means: read
`pnpm doctor`'s output, work out which env vars belong together, and hand-edit
`.env`. The knowledge "subsystem X needs keys A+B and is gated by flag F" lives
only inside `doctor.ts`, as hardcoded checks.

A developer cloning this SaaS starter should be able to run one command, pick
what they want, and get a correctly-stubbed `.env` — without deleting anything
they didn't pick.

## Solution overview

Extract the subsystem knowledge into a single **manifest** consumed by two
scripts:

- **`scripts/setup.ts`** (new, `pnpm setup`) — the write side. Asks which
  subsystems to enable, then flips flags and stubs missing keys in `.env`.
- **`scripts/doctor.ts`** (existing, refactored) — the read side. Verifies what
  the wizard wrote. Iterates the manifest instead of hardcoding checks.

Non-picks stay **dormant, not deleted**: their flag is set `false` (or left
absent), their keys are never touched. This matches the existing "everything is
a flag-gated layer" model.

Nothing is installed (all packages already present) and `nuxt.config.ts`
`extends[]` is never edited (subsystems are flag-gated, not extends-gated) —
same rationale as `gen-layer.ts`, which refuses to string-patch the config array.

## Components

### 1. Manifest — `scripts/integrations.ts` (new)

Plain data. The single source of truth for every subsystem's env shape.

```ts
export interface IntegrationVar {
  key: string        // e.g. 'NUXT_RESEND_KEY'
  hint?: string      // trailing '# comment' written next to a stubbed key
}

export interface Integration {
  id: string          // 'notifications'
  label: string       // 'Email notifications'
  category: 'core' | 'security' | 'growth' | 'billing' | 'observability'
  flag?: string       // env flag that enables it; absent = no on/off flag
  required: IntegrationVar[]  // must be present when enabled (doctor: fail)
  optional?: IntegrationVar[] // nice-to-have when enabled (doctor: warn)
}

export const integrations: Integration[]
```

Entries mirror the current `doctor.ts` sections: `supabase` (core, no flag,
always on), `github-oauth`, `google-oauth`, `sentry`, `betterstack`,
`notifications`, `billing`. Exact list finalized during planning by reading
`doctor.ts` section-by-section.

**Special cases that don't fit the generic shape** (documented, left in
`doctor.ts` as bespoke checks rather than forced through the manifest):

- OAuth "half-configured" — both `CLIENT_ID` and `SECRET` required together; a
  single one set is a `fail`, not a `warn`. Model as two `required` vars; the
  half-configured *message* stays doctor-side.
- BetterStack both-or-neither pairing — same shape (two `required` vars).
- Billing "at least one price id" — `optional` vars; the "nothing to sell"
  warning stays doctor-side.

The manifest carries the *keys and flags*; doctor keeps any bespoke *messaging*.

### 2. Wizard — `scripts/setup.ts` (new, `pnpm setup`)

Uses `consola.prompt` (already a dependency — no new prompt library) and
`dotenv` (already a devDep) for parsing.

Flow:

1. Read existing `.env` into an ordered structure (see §3). Missing file = start
   from empty.
2. Multiselect prompt over `integrations` that have a `flag`, grouped by
   `category`, **pre-checked** if their flag is already `true` in `.env`.
   Core (Supabase, no flag) is shown as always-on, not selectable.
3. For each **picked** integration: set `flag=true`; for every `required` and
   `optional` var not already present, append a stub (`KEY=` + `# hint`).
4. For each **unpicked** flagged integration: set `flag=false`. Keys untouched.
5. Write `.env` back (see §3 for preservation rules).
6. Print a summary of what was enabled/disabled and the blanks still to fill,
   then: "fill in the blanks, then run `pnpm doctor`."

The wizard **writes**; doctor **verifies**. No validation logic is duplicated
between them.

### 3. `.env` rewriting — the one piece with real logic

Isolated as a **pure function** `rewriteEnv(envText: string, picks): string`;
file read/write is a thin shell around it. This is the only part that can
silently corrupt config, so it carries the test.

Rules:

- Parse line-by-line, **preserving order, comments, and blank lines**.
- **Update existing key:** replace value in place, keep line position.
- **Add new key:** append under a `# --- <category> ---` header, grouped by
  category.
- **Unknown key** (not in manifest): never touched.
- **Flag flip:** just a key update (`FLAG=true` / `FLAG=false`).

### 4. `doctor.ts` refactor

Replace the hardcoded per-section checks with a loop over `integrations`: if an
integration's `flag` is on, `fail` on any missing `required` key and `warn` on
any missing `optional` key. Bespoke messages (OAuth half-configured, BetterStack
pairing, billing price-id warning, prod `NUXT_SITE_URL`) stay as-is where the
generic shape doesn't fit cleanly — the manifest is not forced to absorb every
special case. Net effect: doctor shrinks and shares one source of truth with the
wizard.

## Data flow

```
integrations.ts (manifest)
      │
      ├──► setup.ts  ── prompt ──► rewriteEnv(envText, picks) ──► .env
      │
      └──► doctor.ts ── read .env ──► pass/fail report
```

## Error handling

- No `.env`: start from empty, write a fresh one.
- Malformed `.env` line (no `=`): treat as a comment/passthrough, preserve
  verbatim, never crash.
- Existing values are never overwritten with stubs — only missing keys get
  stubbed; a key already present (even if valued) is left alone.
- The wizard does not validate key *contents* — that's doctor's job on the next
  run.

## Testing

- **`scripts/setup.test.ts`** (vitest, pure, no I/O): feed a sample `.env` +
  a pick set through `rewriteEnv` and assert:
  1. picked flags become `true`,
  2. unpicked flags become `false`,
  3. existing unrelated keys survive untouched (value + position),
  4. missing required/optional keys are appended as stubs with hints,
  5. an already-present key is not re-stubbed.
- No e2e — it's a dev CLI, not an app flow. Manual `pnpm setup` against a
  throwaway `.env` is the acceptance check.

## Files touched

- `scripts/integrations.ts` — new (manifest).
- `scripts/setup.ts` — new (wizard).
- `scripts/setup.test.ts` — new (rewrite-function test).
- `scripts/doctor.ts` — refactored to consume the manifest.
- `package.json` — add `"setup": "tsx --env-file-if-exists=.env scripts/setup.ts"`
  (matches doctor's invocation).
- `CLAUDE.md` / `README` — mention `pnpm setup` alongside `pnpm doctor`.

## Out of scope (follow-on specs)

Each adds a manifest entry + a dormant layer; the wizard itself never changes:

- Stripe / LemonSqueezy billing providers (behind the existing `BillingProvider`
  interface + a `BILLING_PROVIDER` switch).
- PostHog layer (product analytics, session replay, feature flags).
- Vue Email templates layer (+ preview route, on top of Resend).
- Support / feedback widget layer.
