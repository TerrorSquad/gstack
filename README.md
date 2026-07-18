# Nuxt + Supabase Starter

A batteries-included starting point for a multi-tenant, role-aware SSR app:
Nuxt 4, Supabase (Postgres + Auth), Nuxt UI v4, i18n (English + Serbian), plus
observability, notifications, seeding, and release tooling wired up. One example
CRUD (`notes`) shows the pattern to copy for your own domain.

> **Using this as a template?** Click **"Use this template"** on GitHub, then
> follow [`SETUP.md`](SETUP.md) — one rename command and env setup and it's yours.

## What's included

- **Auth** — email/password + social login (GitHub, Google via Supabase OAuth),
  registration, password reset, email confirmation. Global role-aware middleware
  (`app/middleware/auth.global.ts`), not the module redirect.
- **Multi-tenancy** — every table is tenant-scoped by RLS via a `current_tenant_id()`
  helper. Self-service registration creates a tenant with the registrant as admin.
- **Roles** — `member` / `admin`, enforced by RLS (the real gate) + page meta (UX).
- **Example CRUD** — `notes`, RLS-scoped. `app/composables/useNotes.ts` + `app/pages/notes/*`.
- **Notifications** — in-app feed + bell + transactional email (Resend). A DB trigger
  fans a new note out to tenant admins; a DB webhook mirrors it to email. Off by
  default — flip `NUXT_PUBLIC_NOTIFICATIONS_ENABLED=true`.
- **Observability** — Sentry (client + server + 5xx forwarding + tunnel), BetterStack
  log forwarding, Vercel Analytics + Speed Insights. All no-op until configured.
- **Seeding** — `pnpm seed` builds a demo tenant (admin + members + notes) with
  `@faker-js/faker`. Idempotent; wipes the `@example.com` demo domain first.
- **i18n** — `sr` (default) + `en`, parity-checked in CI.
- **Testing** — vitest (pure logic) + Playwright (e2e + a11y via axe, both themes).
- **CI/release** — GitHub Actions (lint/test/typecheck, scheduled a11y, PR visual
  regression) + release-please + a user-facing `/changelog`.

## Direction

This is the **G Stack**. What it is and why: [`docs/g-stack.md`](docs/g-stack.md).
What's built and what's next: [`docs/roadmap.md`](docs/roadmap.md). Key decisions
(payments, data layer, Redis, distribution): [`docs/adr/`](docs/adr/).

## Setup

```bash
pnpm install
cp .env.example .env          # fill in after `pnpm supabase start`
pnpm supabase start           # local Postgres + Auth (needs Docker)
pnpm db:reset                 # apply the migration + seed
pnpm db:types                 # regenerate the typed client from the live schema
pnpm dev                      # http://localhost:3000
```

Demo logins after `pnpm db:reset`: `admin@example.com` / `member@example.com`,
password `Demo123!Demo123`.

The typed client (`app/types/database.types.ts`) ships hand-written so `pnpm dev`
and typecheck work before Supabase is up. Run `pnpm db:types` to regenerate it.

## Commands

```bash
pnpm dev / build / preview
pnpm test              # vitest unit tests
pnpm test:e2e          # Playwright e2e + a11y (needs seeded local Supabase)
pnpm lint / fmt
pnpm lint:i18n / lint:i18n-keys
pnpm db:reset          # reset local DB + migrate + seed
pnpm db:types          # regenerate app/types/database.types.ts
pnpm seed              # reseed (SEED_FAST=1 for the minimal set)
```

## Making yourself an admin

Registration makes you your tenant's admin automatically. To promote a member:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Configuring the extras

- **Notifications email**: set `NUXT_PUBLIC_NOTIFICATIONS_ENABLED=true`, `NUXT_RESEND_KEY`,
  and `NUXT_NOTIFICATION_WEBHOOK_SECRET`, then add a Supabase DB webhook on
  `notifications` INSERT → POST `/api/hooks/notification-email` with the secret header.
- **Social login**: enable `[auth.external.github]` / `[auth.external.google]` in
  `supabase/config.toml`, set the client id/secret env vars (see `.env.example`),
  and restart local Supabase. The login-page buttons are already wired.
- **Sentry**: set `NUXT_PUBLIC_SENTRY_DSN` (+ org/project in `nuxt.config.ts`).

## Notes

- Everything is generic ("Starter" branding, indigo theme) — rename in `AppLogo.vue`,
  `app.vue`, `app/assets/css/main.css` (brand palette), and `supabase/templates/*.html`.
- Auth email templates (`supabase/templates/*.html`) carry placeholder branding —
  swap them for yours before shipping.
- `CHANGELOG.md` is release-please's (never hand-edit). The user-facing changelog
  is `app/utils/changelog.ts` → `/changelog`; see the `changelog` skill.
