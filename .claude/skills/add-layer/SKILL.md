---
name: add-layer
description: "Use when adding a new feature to this app — features are Nuxt Layers under layers/, not folders in the root. Covers scaffolding a layer, wiring it into the root extends[], and the auto-import/#shared/i18n conventions that differ from a normal Nuxt app."
metadata:
  author: project
  version: "1.0.0"
---

# Adding a feature layer

A feature in this repo is a **Nuxt Layer** under `layers/<name>/`, not a folder in
the root app. The root project is the base/shell (auth, layouts, stores, core
`server/`); each layer owns its own pages/components/composables/server routes and
is listed in the root `nuxt.config.ts` `extends[]`. See
`docs/adr/0005-nuxt-layers.md`.

## Scaffold

```bash
pnpm gen:layer <name>   # kebab-case, e.g. reports
```

This creates `layers/<name>/nuxt.config.ts` + a sample `app/pages/<name>/index.vue`
and prints the line to add. **Then add that line to the root `nuxt.config.ts`
`extends[]`** — the layer does nothing until it's listed there.

## Conventions that differ from a plain Nuxt app

- **`~`/`@` resolve to the ROOT app, never the current layer.** From inside a
  layer, don't `import from '~/…'` for layer-local code — rely on **auto-imports**.
  Components, composables, `app/utils`, Pinia stores, and Nitro `server/utils`
  auto-import across every layer.
- **Shared types** live in `shared/types/` and import via **`#shared`**
  (`import type { Note } from '#shared/types'`), not a relative path.
- **i18n stays centralized** in the root `i18n/locales/{en,sr}.json`. Add every new
  key to **both** files (flat dot-keys), then `pnpm lint:i18n`.
- **Security is RLS, not app code.** Scope rows with `tenant_id` + a policy using
  `current_tenant_id()`; page-meta `roles` are UX only. New table/function → add a
  migration in `supabase/migrations/`, then `pnpm db:types`.

## The reference pattern

`layers/notes/` is the canonical CRUD example: a `useAsyncData` composable
(`useNotes.ts`) with async mutators that `refresh()`, owner-scoping done by RLS.
Copy its shape for a new resource.
