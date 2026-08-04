# CLAUDE.md

Guidance for Claude Code working in this repo.

## Package manager

Uses **pnpm** (`pnpm-lock.yaml`). Never `npm` or `yarn`.

## Stack

Nuxt 4 SSR + Supabase (Postgres + Auth) + Nuxt UI v4 + i18n (`en` default, `sr`).

## Structure (Nuxt Layers — ADR-0005)

Root project = base/shell (app.vue, layouts, auth pages, stores, base components,
composables, shared utils, core `server/`). Features are layers the root
`extends`: `layers/{marketing,notes,admin,account,billing}`. Add a feature = new
`layers/<name>/` (with a `nuxt.config.ts`) + list it in the root `extends` — or run
`pnpm gen:layer <name>` (see the `add-layer` skill).

- **`layers/ui`** is the design-system layer — theme tokens + AA overrides
  (`main.css`), Nuxt UI defaults (`app.config.ts`), fonts, and brand chrome
  (`AppLogo`, `ThemeSwitcher`). It's the single source of truth every app extends,
  so a future marketing/app/docs split can't drift. See **DESIGN.md**. Don't put
  theme values anywhere else.

- **`~`/`@` always resolve to the ROOT app**, never the current layer. From a
  layer, don't `import from '~/…'` — rely on **auto-imports** (components,
  composables, utils, stores, Nitro `server/utils` all auto-import across layers).
- **Shared types** live in `shared/types/`, imported via **`#shared`**
  (`import type { Note } from '#shared/types'`). `pnpm db:types` +
  `supabase.types` target `shared/types/database.types.ts`.
- **i18n stays centralized** in the root `i18n/locales/*`.

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

`layers/notes/app/composables/useNotes.ts` + `layers/notes/app/pages/notes/*` are the reference pattern:
a composable with `useAsyncData` + async mutators that `refresh()`. Owner-scoping
is done by RLS, not app code.

## Notifications

Off by default (`NUXT_PUBLIC_NOTIFICATIONS_ENABLED`). A DB trigger
(`notify_admins_on_note`) fans a new note out to tenant admins as `notifications`
rows; `app/stores/notifications.ts` + `NotificationBell.vue` render the feed;
a Supabase DB webhook → `server/api/hooks/notification-email.post.ts` mirrors each
row to email via Resend. Keep the whole thing behind the one flag.

## Feedback

Off by default (`NUXT_PUBLIC_FEEDBACK_ENABLED`). Self-hosted, no third-party
widget: `layers/feedback` renders a floating `FeedbackWidget` (signed-in users
only) that submits to the `feedback` table via `useFeedback().submit()`, RLS-
scoped like notes. Append-only — users read their own, admins read the tenant's
(`list()`). No external keys; it's all Supabase.

## Onboarding tour

Off by default (`NUXT_PUBLIC_TOUR_ENABLED`). `layers/tour` wraps driver.js in
`useOnboardingTour()` (named to avoid Nuxt UI's own `useTour`) and auto-starts a
first-run product tour once per browser on the
first authenticated `/dashboard` visit (`tour.client.ts`). Steps target nav
links by `href`, so restyling nav doesn't break it. Completion is remembered in
localStorage (`tour:onboarding:seen`).

## Analytics (PostHog)

Off by default (`NUXT_PUBLIC_POSTHOG_ENABLED` + a key). `layers/analytics` inits
`posthog-js` in a client plugin (`$posthog`), captures SPA pageviews, and exposes
`useFeatureFlag(key, fallback)` — a reactive flag that degrades to `fallback` when
PostHog is off, so gated UI works with no PostHog. Session replay is a separate
opt-in flag (`NUXT_PUBLIC_POSTHOG_SESSION_REPLAY`). Client-only — no server capture
(add `posthog-node` if you need it). Distinct from Vercel Analytics (traffic).

## Database

Migrations in `supabase/migrations/`. Run `pnpm supabase <cmd>` (CLI isn't global).
After changing a table/function, run `pnpm db:types` to regenerate
`shared/types/database.types.ts` (hand-written until you do) or typecheck fails.
Never edit migrations retroactively once applied to a real DB — add a new one.

## Seeding

`pnpm seed` (`scripts/seed/seed.ts`) uses `@faker-js/faker` + the service role to
build a demo tenant. Idempotent — wipes the `@example.com` domain first. Creds
live in `scripts/seed/fixtures.ts` (shared with e2e). `SEED_FAST=1` = minimal set.

## Setup wizard

`pnpm setup` (`scripts/setup.ts`) reads `scripts/integrations.ts` (the subsystem
manifest) and writes `.env`: it flips the flag for each subsystem you pick and
stubs any missing keys. Unpicked subsystems are set to `false`, never deleted;
existing values are never overwritten. It writes; `pnpm doctor` verifies — both
share the one manifest, so adding a subsystem there wires up both scripts.

## Testing

- `**/*.test.ts` (vitest) — pure logic only, no DOM/Supabase.
- `e2e/*.spec.ts` (Playwright) — full flows against seeded local Supabase.
  Projects: `chromium` (public smoke) and `a11y` (axe, both themes). A new spec
  runs only once added to a project's `testMatch`.

## i18n

`en` is the default locale, `sr` the alternate. Add every new key to **both**
`i18n/locales/{en,sr}.json` (flat dot-keys), then `pnpm lint:i18n`. Build dynamic
keys with template literals (`` `common.role.${x}` ``) so the key-usage checker
resolves them.

## Email templates (generated)

`supabase/templates/*.html` are **output, not source** — don't hand-edit them.
They render from `emailBase()` in `layers/email/server/utils/emailShell.ts` (which
also owns `EMAIL_BRAND`, the inlined palette the app's own mail uses, since email
clients strip CSS custom properties). Edit the specs in
`scripts/gen-auth-templates.ts`, then `pnpm gen:auth-templates`.
`emailShell.test.ts` compares the committed HTML against the generator, so drift
fails on pre-commit rather than shipping a mismatched password-reset email.

## Screenshots

`pnpm screenshots` (Playwright project gated behind `SCREENSHOTS=1`) captures every
route in both themes at 1920×1080 plus a Pixel 7 mobile pass into
`docs/screenshots/`. Opt-in so a bare `pnpm test:e2e` never dirties the tree. Not a
visual-regression baseline — no pixel diffing.

## Docs site (`site/`)

The GitHub Pages showcase: a **standalone** Nuxt project extending `docus`, with
its own `package.json`, lockfile and `pnpm-workspace.yaml` (that last one stops
pnpm walking up and treating `site/` as an unlisted member of the root workspace,
which silently installs nothing). It is deliberately not part of the starter's
dependency tree — someone cloning the template shouldn't get the docs site's deps.

`site/nuxt.config.ts` sets `app.baseURL` to `/gstack/`; Pages serves the repo under
its name, so that must match the repo or every asset 404s in production while
working fine locally. Deployed by `.github/workflows/pages.yml` on pushes touching
`site/**`. Content is authored fresh — ADRs are linked to GitHub, not copied, to
avoid a second drifting version.

## Changelog

Two changelogs: `CHANGELOG.md` is release-please's (**never hand-edit**); the
user-facing feed is `app/utils/changelog.ts` → `/changelog`. Add a dated entry for
user-visible changes, one entry per date. See the `changelog` skill.

## Formatting / lint

`forge.toml` wires oxfmt/oxlint into a pre-commit hook that auto-fixes and restages.
Don't run them proactively during dev.
