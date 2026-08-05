# GStack

An opinionated, RLS-first, type-safe, batteries-included stack for shipping
multi-tenant SaaS with Nuxt — distributed as a GitHub template repository.

This document is the source of truth for **what the stack is and why**. The
build order lives in [`roadmap.md`](./roadmap.md); reversible-but-significant
choices are recorded as [ADRs](./adr/).

## Principles

1. **RLS-first security.** Access control lives in the database (Postgres Row
   Level Security), not in app code. Page-level role gates are UX only. A bug in
   a component can never leak another tenant's data.
2. **Type-safe end to end.** DB schema → generated types → composables → UI. A
   query that under-selects fails at `typecheck`, not in production.
3. **Batteries included, but flag-gated.** Notifications, observability, email,
   billing — all wired, all off by default behind env flags. Nothing
   half-works; you flip one switch per subsystem.
4. **Generic and rebrandable.** No product identity baked in. One place to
   rename, one palette to swap.
5. **DX over cleverness.** Boring, legible code. The laziest solution that
   actually works. Deletion over addition.

## The stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Nuxt 4** (SSR, Nitro) | Vue 3, file-based routing, server routes |
| UI | **Nuxt UI v4** + Tailwind v4 | themed once globally via `app.config.ts` |
| Data / Auth | **Supabase** | Postgres + Auth + RLS + Storage + Realtime |
| Types | **generated from schema** (`supabase gen types`) | end-to-end, no ORM required |
| State | **Pinia** (cross-page) + composables (`useAsyncData`) | store only for shared mutable state |
| i18n | **@nuxtjs/i18n** | `en` default + `sr`, key-parity enforced in CI |
| Payments | **Polar** (Merchant of Record) behind an adapter | Serbia-compatible; see [ADR-0001](./adr/0001-payments-provider.md) |
| Edge KV / rate-limit | **Upstash Redis** | distributed limits + cache; see [ADR-0003](./adr/0003-upstash-redis.md) |
| Email | **Resend** (transactional) + Supabase auth emails | inline-styled HTML templates |
| Observability | **Sentry** + **BetterStack** + **Vercel Analytics** | errors, logs, web vitals |
| Testing | **Vitest** (logic) + **Playwright** (e2e) + **axe** (a11y) | a11y enforced in light + dark |
| Release | **release-please** + hand-curated `/changelog` | dev changelog vs user changelog |
| Tooling | **oxlint** + **oxfmt** + **forge** hooks + **pnpm** | fast, auto-fixing pre-commit |
| Deploy | **Vercel** (portable Nitro) | any Nitro target works |
| Distribution | **GitHub template repository** | see [ADR-0004](./adr/0004-distribution-github-template.md) |

### Deliberately deferred

- **Drizzle ORM** — generated types already give end-to-end safety; adopt only
  when server-side query complexity demands it ([ADR-0002](./adr/0002-data-layer.md)).
- **Direct Stripe** — not available to Serbian sellers; Polar (MoR) is used instead.
- **Monorepo** — a single deployable for now; a monorepo waits until a second app
  exists (YAGNI). Note: in-repo **Nuxt Layers** ARE used for feature organization
  ([ADR-0005](./adr/0005-nuxt-layers.md)) — that's not a monorepo.

## How it compares

- **vs. T3 / create-t3-app** — same type-safety ethos, but RLS-first Postgres
  instead of app-layer authz, and Vue/Nuxt instead of React/Next.
- **vs. commercial Nuxt SaaS kits** (e.g. nuxtstarterkit.com) — we match auth,
  i18n and testing, and lead on observability, a11y, release automation and
  proven multi-tenancy. They lead on breadth of prebuilt UI and on having
  someone you can page. Billing is no longer the gap it was — Polar checkout,
  portal and webhooks ship behind a flag. See the site's `/compare` page, which
  is the version kept honest about where this loses.

## Non-goals

- Not a no-code/low-code platform.
- Not framework-agnostic — it is Nuxt + Supabase, on purpose.
- Not a kitchen sink: every dependency earns its place or is cut.
