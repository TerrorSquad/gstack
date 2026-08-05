---
seo:
  title: GStack — RLS-first Nuxt + Supabase SaaS starter
  description: An opinionated, type-safe, batteries-included stack for shipping multi-tenant SaaS with Nuxt. Auth, RLS multi-tenancy, billing, email, i18n, a11y and release automation, wired and flag-gated.
---

::u-page-hero
---
orientation: horizontal
class: grid-surface
---
#headline
Free · MIT · Nuxt 4 · Supabase · Postgres RLS

#title
Ship multi-tenant SaaS, not scaffolding.

#description
A free, MIT-licensed Nuxt 4 + Supabase starter where access control lives in the
database, every subsystem is wired but off by default, and one tenant can never
read another's rows — proven by a test, not a promise.

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
gh repo create my-app --template TerrorSquad/gstack --private --clone
cd my-app            # or hit "Use this template" on GitHub

pnpm install
pnpm setup          # pick your integrations; writes .env
pnpm supabase start # local Postgres + Auth (needs Docker)
pnpm db:reset       # migrate + seed a demo tenant
pnpm dev            # http://localhost:3000
```
::

::u-page-section
---
headline: 01 — The guarantee
---
#title
The isolation test

#description
Most starters claim multi-tenancy. This one logs in as a second tenant and
asserts the first tenant's rows are invisible — through the rendered page, the
search box, and the SSR payload. Widen a policy by accident and this goes red.

#default
```ts [e2e/tenant-isolation.spec.ts]
test('a Globex admin cannot see Acme notes', async ({ page }) => {
  await login(page, ADMIN2.email)

  // The seeded Acme secret title must be absent from Globex's notes list.
  await page.goto('/notes')
  await expect(page.getByText(ACME_SECRET_NOTE_TITLE)).toHaveCount(0)
})
```

Every table carries a `tenant_id`, and RLS scopes rows through a
`current_tenant_id()` security-definer helper that reads the caller's own
profile. Page-level role gates are UX only — a bug in a component cannot leak
another tenant's data, because the component never had the rows.

:u-button{to="/docs/architecture/multi-tenancy" variant="link" trailing-icon="i-lucide-arrow-right" label="How multi-tenancy works"}
::

::u-page-section
---
headline: 02 — What it looks like
---
#title
The screens you don't have to build

#description
Dashboard, notes CRUD, tenant admin with invites and impersonation, billing,
account with avatar upload, pricing, changelog and a feedback widget — all in
the template on the first run, in both themes and on mobile.

#default
:u-button{to="/screens" size="lg" trailing-icon="i-lucide-arrow-right" label="See the screens"}
::

::u-page-section
---
headline: 03 — Batteries included
---
#title
Every subsystem is one env flag

#description
Nothing half-works. Each subsystem is fully wired and switched off until you set
its flag, so a bare clone runs end-to-end with **zero third-party accounts** —
Supabase runs locally in Docker.

#default
| Subsystem | Flag | Needs an account |
| --- | --- | --- |
| Supabase — Postgres, Auth, RLS, Storage | *core, always on* | No (local via Docker) |
| Feedback widget → your own DB | `NUXT_PUBLIC_FEEDBACK_ENABLED` | No |
| Billing — checkout, portal, webhooks | `NUXT_PUBLIC_BILLING_ENABLED` | Polar |

Six more — OAuth, notifications, analytics, the onboarding tour, error tracking
and log forwarding — are on :u-button{to="/stack" variant="link" class="!p-0" label="the stack page"}.

`pnpm setup` writes the flags, `pnpm doctor` verifies them, and both read the
same manifest — so a subsystem can't be half-configured without one of them
saying so.

:u-button{to="/docs/getting-started/configuration" variant="link" trailing-icon="i-lucide-arrow-right" label="Configuration reference"}
::

::u-page-section
---
headline: 04 — Proof, not adjectives
---
#title
What CI won't let you break

#description
The interesting part of a starter isn't what it ships on day one, it's what it
refuses to let you regress on day ninety.

#default
| Gate | What it catches |
| --- | --- |
| `pnpm lint` | oxlint + oxfmt, auto-fixing on pre-commit |
| `pnpm lint:i18n` | a key added to `en` but not `sr`, or a key nothing uses |
| `pnpm test` | logic + the email-shell drift test: auth templates that no longer match their generator |
| `pnpm typecheck` | a query that under-selects, against types generated from the live schema |
| `pnpm test:e2e` | tenant isolation, auth flows, notes CRUD |
| axe, twice daily | contrast and landmark failures, on every page, in **both** light and dark |

Releases are cut by release-please from conventional commits; the user-facing
changelog is curated separately, so shipping a refactor doesn't spam your users.
::

::u-page-section
---
headline: 05 — What else is in the box
title: The parts you would otherwise build twice
description: Ten independent Nuxt layers over a shared design system, and the unglamorous work that usually gets deferred until it hurts.
features:
  - title: Type-safe end to end
    description: Postgres schema → generated types → composables → UI. No ORM. Change a column and the build tells you every call site that cared.
    icon: i-lucide-shield-check
  - title: Auth that survives SSR
    description: Email/password plus GitHub and Google OAuth, password reset, confirmation, and a role-aware global middleware instead of the Supabase module's redirect.
    icon: i-lucide-key-round
  - title: One email shell
    description: Transactional mail and the Supabase auth templates render from the same generated shell, so the branding can't drift. A unit test fails if it does.
    icon: i-lucide-mail
  - title: Bilingual from the start
    description: English and Serbian, with key parity enforced in CI. Dynamic keys are written so the usage checker can still resolve them.
    icon: i-lucide-languages
  - title: Portable deploy
    description: Nitro output, so Vercel is the default and not a lock-in. Supabase runs locally in Docker for development and CI alike.
    icon: i-lucide-cloud
  - title: Decisions on the record
    description: The reversible-but-significant choices — Polar over Stripe, no ORM yet, layers over a monorepo — are written down as ADRs with their trade-offs.
    icon: i-lucide-file-text
---
::

::u-page-section
---
headline: 06 — In the wild
---
#title
Someone built a real product on it in 13 days

#description
[job-finder](https://goranninkovic.com/projects/job-finder) is a multi-tenant
product that reads company ATS boards, scores every posting against your CV with
an LLM, and drafts the application material. Tenancy, auth, billing, email and
the admin surface came from GStack on day one, so the 13 days went on the part
that was actually the product.

That is the whole claim being made here: not that the starter is clever, but
that the work it removes is work you would otherwise do before writing a line
of your own.
::

::u-page-section
---
links:
  - label: Read the docs
    to: /docs/getting-started/introduction
    size: xl
    trailingIcon: i-lucide-arrow-right
  - label: Browse the decisions
    to: /docs/reference/decisions
    size: xl
    color: neutral
    variant: subtle
---
#title
Free and MIT licensed

#description
Clone it, rename it with one command, and start building your product instead of
its scaffolding.
::
