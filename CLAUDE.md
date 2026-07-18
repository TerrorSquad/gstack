# CLAUDE.md

Guidance for Claude Code working in this repo.

## Package manager

Uses **pnpm** (`pnpm-lock.yaml`). Never `npm` or `yarn`.

## Stack

Nuxt 4 SSR + Supabase (Postgres + Auth) + Nuxt UI v4 + i18n (`sr` default, `en`).

## Auth

`@nuxtjs/supabase` with `redirect: false` — module redirect disabled. Auth is:

- `app/stores/auth.ts` (`useAuthStore`) — `login()`, `register()`, `logout()`,
  `ensureProfile()`, `role`, `isAuthenticated`. `profiles.id` **is** the auth user id.
- `app/middleware/auth.global.ts` — guards every non-`public` route, enforces
  `definePageMeta({ roles })`.

`login()` explicitly calls `getClaims()` and sets `user.value` before navigating,
because `signInWithPassword` resolves before the `onAuthStateChange` listener fires.
Don't remove that sync or middleware bounces straight back to `/login`.

Roles: `member`, `admin`. RLS is the real security layer; page-meta roles are UX only.

## Example CRUD (notes)

`app/composables/useNotes.ts` + `app/pages/notes/*` are the reference pattern:
a composable with `useAsyncData` for the list plus plain async mutators that
`refresh()`. Owner-scoping is done by the `notes_owner_all` RLS policy, not app code.

## Database

Migrations in `supabase/migrations/`. Run `pnpm supabase <cmd>` (CLI isn't global).
After adding/changing a table or function, run `pnpm db:types` to regenerate
`app/types/database.types.ts` or typecheck fails. Never edit migrations
retroactively — add a new one.

## i18n

Add every new key to **both** `i18n/locales/sr.json` and `en.json` (flat dot-keys),
then `pnpm lint:i18n`. Serbian is the source of truth. Build dynamic keys with
template literals (`` `common.role.${x}` ``) so the key-usage checker resolves them.

## Formatting / lint

`forge.toml` wires oxfmt/oxlint into a pre-commit hook that auto-fixes and restages.
Don't run them proactively during dev.
