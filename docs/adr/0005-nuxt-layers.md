# ADR-0005: Nuxt Layers for feature organization

**Status:** Accepted · **Date:** 2026-07-19

## Context

As the starter grows (marketing, notes, admin, account, billing…), a flat
`app/` with everything mixed together gets harder to navigate and makes feature
boundaries implicit. We want colocation by feature and a clear, repeatable
pattern for adding one — established early, before more code piles up.

ADR-0002-era notes deferred "monorepo / Nuxt layers (YAGNI)". Nuxt **Layers** for
in-repo organization are a different, lighter thing than a monorepo: no separate
packages, no build graph — just directories the root config `extends`. Adopting
them for organization does not contradict deferring a monorepo.

## Decision

Organize by **feature layers**. The root project is the **base/shell** (shared
foundation); each feature is a layer the root `extends`.

```
shared/types/            # layer-agnostic types (#shared alias) — see "Types" below
app/                     # base: app.vue, layouts, auth pages, stores, base
server/                  #       components, composables, shared utils, core server
layers/
  marketing/  app/pages (/,/pricing,/terms,/privacy), app/utils/plans
  notes/      app/pages/notes, app/composables/useNotes
  admin/      app/pages/admin, server/api/admin/*
  account/    app/pages/account, server/api/account/*
```

Adding a feature = add `layers/<name>/` with its `nuxt.config.ts` and its
`app/`/`server/` subtree, then list it in the root `extends`.

## Key rules (learned building this)

- **`~` / `@` always resolve to the ROOT app**, not the current layer. So a
  layer file **cannot** `import … from '~/utils/x'` for its own or another
  layer's code. Rely on **auto-imports** instead: components, composables, utils,
  stores, and Nitro `server/utils` are auto-imported across all layers.
- **Types aren't auto-imported**, and `~` won't reach them from a layer. Shared
  types live in **`shared/types/`** and are imported via the **`#shared`** alias
  (`import type { Note } from '#shared/types'`), which resolves from any layer,
  app or server. `supabase.types` and `pnpm db:types` both target
  `shared/types/database.types.ts`.
- **i18n stays centralized** at the root (`i18n/locales/*`) — one parity-checked
  key set, not per-layer message merging.
- Config (`nuxt.config`, `app.config`), the base layouts, auth, and CSS stay in
  the root shell.

## Consequences

- Clear feature boundaries and an obvious place to add code.
- A small tax: cross-cutting shared code must go through auto-imports or
  `#shared`, and each layer needs a (near-empty) `nuxt.config.ts`.
- Still a single deployable — a monorepo remains deferred until a second app exists.
