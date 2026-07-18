# Roadmap

Build order for the G Stack. Each phase is independently shippable and leaves the
template in a working state. Stack rationale lives in [`g-stack.md`](./g-stack.md);
open decisions are [ADRs](./adr/).

Status legend: ✅ done · 🔜 next · ⬜ planned · 💤 deferred

---

## Phase 0 — Foundation ✅

Auth (email/password + GitHub/Google OAuth, reset, confirm), multi-tenant RLS
schema, notes example CRUD, in-app + email notifications, observability
(Sentry/BetterStack/Vercel), faker seeding, i18n (en/sr), Vitest + Playwright +
axe, release-please + user changelog, security headers, in-memory rate limiter.

## Phase 1 — Template-ready 🔜

Make the repo a clean GitHub template (see [ADR-0004](./adr/0004-distribution-github-template.md)).

- [ ] `LICENSE` (MIT), `CONTRIBUTING.md`, issue/PR templates in `.github/`.
- [ ] `SETUP.md` + a one-shot rename script (`Starter` → app name, favicon,
      brand palette, `siteUrl`) so a fresh clone is yours in minutes.
- [ ] Verify a from-template bootstrap: `pnpm i && supabase start && db:reset && dev`.
- [ ] Reset `.release-please-manifest.json`/version and empty the user changelog
      to a single "Initial release" entry.
- [ ] Mark the GitHub repo as a template; document "Use this template".

**Acceptance:** a new repo from the template runs locally with only env setup.

## Phase 2 — Marketing surface ⬜

A SaaS needs a front door; today `/` redirects to login.

- [ ] Public landing page (hero, features, CTA) at `/`.
- [ ] Pricing page (plan table) — data-driven, ready to bind to billing in Phase 4.
- [ ] Legal: `/terms`, `/privacy` (static, editable).
- [ ] SEO: per-page `useSeoMeta`, Open Graph/Twitter tags, `sitemap.xml`, canonical URLs.

**Acceptance:** unauthenticated visitors get a real marketing site; Lighthouse SEO ≥ 95.

## Phase 3 — Account & admin ⬜

Close the operational gaps vs. commercial kits.

- [ ] Account: avatar upload (Supabase Storage), change email/password,
      **delete account** (GDPR self-service).
- [ ] Admin: user management table, role changes, **impersonation**, ban/unban.
- [ ] Waitlist: capture + invite flow (reuses the invite pattern).

**Acceptance:** an admin can manage members; a user can fully self-serve their account.

## Phase 4 — Billing ⬜ (unblocked; see [ADR-0001](./adr/0001-payments-provider.md))

Provider-agnostic billing; **Polar** as the first (Serbia-compatible) implementation.

- [ ] `subscriptions` table (tenant-scoped) + RLS + generated types.
- [ ] `BillingProvider` adapter interface (checkout, portal, webhook parse, sync).
- [ ] Polar adapter: checkout link, customer portal, `/api/hooks/billing` webhook
      (idempotent, reuses the notifications webhook pattern).
- [ ] `useEntitlements()` / plan gate; bind the Phase 2 pricing page to real plans.

**Acceptance:** a tenant can subscribe, a webhook flips its plan, gated features unlock.

## Phase 5 — Infra hardening ⬜

- [ ] Upstash Redis: distributed rate limiting + KV cache, env-gated with
      in-memory fallback ([ADR-0003](./adr/0003-upstash-redis.md)).
- [ ] `nuxt-security`: real CSP (nonces), CSRF, tightened headers over the baseline.
- [ ] Passkeys / WebAuthn via Supabase.

**Acceptance:** rate limits hold across instances; CSP passes; passkey login works.

## Phase 6 — Data-layer option 💤

- [ ] Adopt Drizzle as a typed server-query layer **only if** server query
      complexity demands it — Supabase keeps owning schema + RLS ([ADR-0002](./adr/0002-data-layer.md)).

---

## Sequencing notes

- Phase 1 first: it's cheap and makes everything after it distributable.
- Phases 2–4 are the commercial-parity core; 2 before 4 so pricing has a home.
- Phase 5 is independent — pull it forward if you hit abuse or need a strict CSP.
