---
seo:
  title: GStack — RLS-first Nuxt + Supabase SaaS starter
  description: An opinionated, type-safe, batteries-included stack for shipping multi-tenant SaaS with Nuxt. Auth, RLS multi-tenancy, billing, email, i18n, a11y and release automation, wired and flag-gated.
---

::u-page-hero
---
orientation: horizontal
---
#title
Ship multi-tenant SaaS, not scaffolding.

#description
GStack is an opinionated Nuxt 4 + Supabase starter where access control lives in
the database, every subsystem is wired but off by default, and one tenant can
never read another's rows — proven by a test, not a promise.

#links
  :::u-button
  ---
  to: /docs/getting-started/installation
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  to: https://github.com/TerrorSquad/gstack
  target: _blank
  size: xl
  color: neutral
  variant: subtle
  icon: i-simple-icons-github
  ---
  View on GitHub
  :::

#default
```bash
pnpm install
pnpm setup          # pick your integrations; writes .env
pnpm supabase start # local Postgres + Auth (needs Docker)
pnpm db:reset       # migrate + seed a demo tenant
pnpm dev            # http://localhost:3000
```
::

::u-page-section
---
title: Batteries included, every one flag-gated
description: Nothing half-works. Each subsystem is fully wired and switched off until you set its env flag, so a bare clone runs with no third-party account.
features:
  - title: RLS-first multi-tenancy
    description: Every table carries a tenant_id and Postgres Row Level Security scopes rows to the caller's tenant. Page-level role gates are UX only — a bug in a component cannot leak another tenant's data.
    icon: i-lucide-shield-check
  - title: Auth that survives SSR
    description: Email/password plus GitHub and Google OAuth, password reset, email confirmation, and a global role-aware middleware instead of the Supabase module's redirect.
    icon: i-lucide-key-round
  - title: Features as Nuxt Layers
    description: Marketing, notes, admin, account, billing, email, feedback, tour and analytics are independent layers. Adding a feature is one scaffold command plus one line in extends.
    icon: i-lucide-layers
  - title: Billing
    description: Polar checkout, customer portal and webhook behind an adapter — a Merchant of Record, so it works from countries Stripe won't onboard.
    icon: i-lucide-credit-card
  - title: One email shell
    description: Transactional mail and the Supabase auth templates render from the same generated shell, so the branding can't drift. A unit test fails if it does.
    icon: i-lucide-mail
  - title: Accessibility, enforced
    description: Playwright and axe run every page in light and dark on a schedule. Contrast overrides live in one design-system layer.
    icon: i-lucide-accessibility
---
::

::u-page-section
#title
The isolation test

#description
Most starters claim multi-tenancy. This one logs in as a second tenant and asserts
the first tenant's rows are invisible through the real HTTP surface — so the claim
fails loudly the day someone widens a policy.

#default
```ts [e2e/tenant-isolation.spec.ts]
test('Globex cannot read Acme rows', async ({ page }) => {
  await login(page, GLOBEX_ADMIN.email)
  await page.goto('/notes')
  await expect(page.getByText(ACME_SECRET_NOTE_TITLE)).toHaveCount(0)
})
```
::

::u-page-section
---
links:
  - label: Read the docs
    to: /docs/getting-started/introduction
    size: xl
    trailingIcon: i-lucide-arrow-right
---
#title
Free and MIT licensed

#description
Clone it, rename it with one command, and start building your product instead of
its scaffolding.
::
