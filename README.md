# Nuxt + Supabase Starter

A minimal, opinionated starting point for a role-aware SSR app: Nuxt 4, Supabase
(Postgres + Auth), Nuxt UI v4, i18n (Serbian + English), and one example CRUD
(`notes`) to copy for your own domain.

Extracted from a production app, stripped to the reusable skeleton.

## What's included

- **Auth** — email/password login, registration, password reset, email confirmation.
  Custom global middleware (`app/middleware/auth.global.ts`) with role gates, not
  the Supabase module's built-in redirect.
- **Roles** — `member` / `admin`, enforced by RLS (the real gate) and page meta
  (`definePageMeta({ roles: ['admin'] })`, UX only). See `/admin` for the pattern.
- **Example CRUD** — `notes`, owner-scoped by RLS. The composable + pages
  (`app/composables/useNotes.ts`, `app/pages/notes/*`) are the pattern to copy.
- **i18n** — `sr` (default) + `en`, flat dot-keys, parity-checked in CI.
- **Tooling** — oxlint, oxfmt, vitest, Playwright, GitHub Actions CI, pre-commit
  hooks via forge.

## Setup

```bash
pnpm install
cp .env.example .env          # fill in after `pnpm supabase start`
pnpm supabase start           # local Postgres + Auth (needs Docker)
pnpm db:reset                 # apply the migration
pnpm db:types                 # regenerate the typed client from the live schema
pnpm dev                      # http://localhost:3000
```

The typed client (`app/types/database.types.ts`) ships hand-written so `pnpm dev`
and typecheck work before you start Supabase. Run `pnpm db:types` once your stack
is up to regenerate the authoritative version.

## Commands

```bash
pnpm dev / build / preview
pnpm test            # vitest unit tests
pnpm test:e2e        # Playwright (spins up its own dev server on :3010)
pnpm lint / fmt
pnpm lint:i18n       # locale key parity (sr vs en)
pnpm lint:i18n-keys  # every $t() key exists in the locales
pnpm db:reset        # reset local DB + re-run migrations
pnpm db:types        # regenerate app/types/database.types.ts
```

## Making yourself an admin

Roles default to `member`. Promote a user by hand:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Notes

- Auth email templates (`supabase/templates/*.html`) are Serbian and carry
  placeholder branding — swap them for yours before shipping.
- The auth flow relies on an explicit `getClaims()` sync in `auth.login()`; if
  login bounces back to `/login`, that step is why. See the store comments.
