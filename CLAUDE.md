# CLAUDE.md

Guidance for Claude Code working in this repo.

## Package manager

Uses **pnpm** (`pnpm-lock.yaml`). Never `npm` or `yarn`.

## Stack

Nuxt 4 SSR + Supabase (Postgres + Auth) + Nuxt UI v4 + i18n (`sr` default, `en`).

## Auth

`@nuxtjs/supabase` with `redirect: false` — module redirect disabled.

- `app/stores/auth.ts` (`useAuthStore`) — `login()`, `register()`, `logout()`,
  `ensureProfile()`, `role`, `isAuthenticated`. `profiles.id` **is** the auth user id.
- `app/middleware/auth.global.ts` — guards every non-`public` route, enforces
  `definePageMeta({ roles })`.

`login()`/`register()` explicitly call `getClaims()` and set `user.value` before
navigating, because `signInWithPassword` resolves before `onAuthStateChange` fires.
Don't remove that sync or middleware bounces back to `/login`.

Roles: `member`, `admin`. RLS is the real security layer; page-meta roles are UX only.

## Multi-tenancy

Single-DB / shared-schema. Every table has `tenant_id`; RLS scopes rows via the
`current_tenant_id()` security-definer helper (reads the caller's profile). Signup
(`handle_new_user`) creates a tenant and makes the registrant its admin.
Performance upgrade path is noted in the migration (move tenant_id to a JWT claim).

## Example CRUD (notes)

`app/composables/useNotes.ts` + `app/pages/notes/*` are the reference pattern:
a composable with `useAsyncData` + async mutators that `refresh()`. Owner-scoping
is done by RLS, not app code.

## Notifications

Off by default (`NUXT_PUBLIC_NOTIFICATIONS_ENABLED`). A DB trigger
(`notify_admins_on_note`) fans a new note out to tenant admins as `notifications`
rows; `app/stores/notifications.ts` + `NotificationBell.vue` render the feed;
a Supabase DB webhook → `server/api/hooks/notification-email.post.ts` mirrors each
row to email via Resend. Keep the whole thing behind the one flag.

## Database

Migrations in `supabase/migrations/`. Run `pnpm supabase <cmd>` (CLI isn't global).
After changing a table/function, run `pnpm db:types` to regenerate
`app/types/database.types.ts` (hand-written until you do) or typecheck fails.
Never edit migrations retroactively once applied to a real DB — add a new one.

## Seeding

`pnpm seed` (`scripts/seed/seed.ts`) uses `@faker-js/faker` + the service role to
build a demo tenant. Idempotent — wipes the `@example.com` domain first. Creds
live in `scripts/seed/fixtures.ts` (shared with e2e). `SEED_FAST=1` = minimal set.

## Testing

- `**/*.test.ts` (vitest) — pure logic only, no DOM/Supabase.
- `e2e/*.spec.ts` (Playwright) — full flows against seeded local Supabase.
  Projects: `chromium` (public smoke), `a11y` (axe), `screenshots-*` (visual
  regression). A new spec runs only once added to a project's `testMatch`.
- Screenshot baselines are Linux-only — generate via `pnpm screenshots:update`
  (Docker) and commit the `*-linux.png` files. None are committed yet.

## i18n

Add every new key to **both** `i18n/locales/{sr,en}.json` (flat dot-keys), then
`pnpm lint:i18n`. Serbian is source of truth. Build dynamic keys with template
literals (`` `common.role.${x}` ``) so the key-usage checker resolves them.

## Changelog

Two changelogs: `CHANGELOG.md` is release-please's (**never hand-edit**); the
user-facing feed is `app/utils/changelog.ts` → `/changelog`. Add a dated entry for
user-visible changes, one entry per date. See the `changelog` skill.

## Formatting / lint

`forge.toml` wires oxfmt/oxlint into a pre-commit hook that auto-fixes and restages.
Don't run them proactively during dev.
