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

## Phase 1 — Template-ready ✅

Make the repo a clean GitHub template (see [ADR-0004](./adr/0004-distribution-github-template.md)).

- [x] `LICENSE` (MIT), `CONTRIBUTING.md`, issue/PR templates in `.github/`.
- [x] `SETUP.md` + a one-shot rename script (`scripts/rename.mjs`: name,
      package, `siteUrl`; palette/favicon left as documented manual steps).
- [x] Verify a from-template bootstrap: `pnpm i && supabase start && db:reset && dev`.
- [x] Reset version (`0.1.0`) + manifest and reduce the user changelog to a
      single "Initial release" entry.
- [x] Document "Use this template" (README + `SETUP.md`). *Flipping the GitHub
      "Template repository" setting happens once the repo is pushed to GitHub —
      no remote yet.*

**Acceptance:** a new repo from the template runs locally with only env setup. ✅

## Phase 2 — Marketing surface ✅

A public front door (a `marketing` layout with header + footer); `/` is now a
landing page instead of a redirect.

- [x] Public landing page (hero, feature grid, CTA) at `/`.
- [x] Pricing page — data-driven from `app/utils/plans.ts` (the `id` is the seam
      for Phase 4 billing).
- [x] Legal: `/terms`, `/privacy` (static placeholders, clearly marked to replace).
- [x] SEO: per-page `useSeoMeta` (title/description/OG/Twitter), `@nuxtjs/sitemap`
      at `/sitemap.xml` (explicit public URLs), global canonical, `site.url` config.
      a11y covers the marketing pages in both themes. *(Follow-up: an `og:image` —
      needs a static asset or `nuxt-og-image`.)*

**Acceptance:** unauthenticated visitors get a real marketing site. ✅ (Run
Lighthouse in CI to confirm SEO ≥ 95 on your deploy URL.)

## Phase 3 — Account & admin ✅

Close the operational gaps vs. commercial kits.

- [x] Account: avatar upload (Supabase Storage bucket + RLS), change email +
      password, **delete account** (GDPR, service-role route).
- [x] Admin: member table with role changes, ban/unban (native Supabase ban),
      **impersonation** (magic link), and remove-member — all admin-gated,
      same-tenant-checked server routes with self-mutation guards.
- [x] **Team invites** instead of a global waitlist: an admin invites by email;
      `handle_new_user` reads the `tenant_id` metadata so the invitee joins the
      inviting tenant as a member (a global waitlist doesn't fit the tenant model).

**Acceptance:** an admin can manage members; a user can fully self-serve their
account. ✅ (Actions verified end-to-end incl. self-guards.)

> Auth note: `serverSupabaseUser()` returns null in this module version — server
> routes resolve the user via `serverSupabaseClient(event).auth.getUser()`, and
> client→internal-API data loads use `useFetch` (not `useAsyncData`+`$fetch`) so
> the auth cookie is forwarded on SSR.

## Phase 4 — Billing ✅ (see [ADR-0001](./adr/0001-payments-provider.md)) — `layers/billing`

Provider-agnostic billing; **Polar** as the first (Serbia-compatible) implementation.

- [x] `subscriptions` table (one row per tenant) + RLS (members read own tenant;
      only the service role writes) + generated types.
- [x] `BillingProvider` adapter interface (checkout, portal, `parseWebhook`) with a
      Polar implementation over the REST API.
- [x] Polar: checkout + customer-portal routes (auth-gated), `/api/hooks/billing`
      webhook — Standard-Webhooks signature verified, idempotent upsert keyed on
      tenant_id. **Verified end-to-end**: valid sig → row synced, bad sig → 401.
- [x] `useSubscription()` (effective plan + `isAtLeast(tier)` gate); pricing-page
      CTAs start checkout when signed in; a `/billing` page (upgrade + manage).

**Acceptance:** a tenant can subscribe, the webhook flips its plan, gated features
unlock. ✅ (Live Polar checkout/portal need real credentials — env-gated, no-op
until set; webhook + sync + entitlements verified locally.)

## Phase 5 — Infra hardening ✅

- [x] Upstash Redis: distributed rate limiting, env-gated with in-memory
      fallback ([ADR-0003](./adr/0003-upstash-redis.md)). (KV cache deferred —
      the seam is the same `getRedis()`; add a memoize helper when a hot server
      read needs it.)
- [x] `nuxt-security`: nonce-based CSP + tightened headers, per-directive
      allowlist for the hosts the stack talks to (Supabase, Vercel, fonts).
      Verified against the real login flow — zero violations.
- [x] **CSRF (token)** via nuxt-csurf on POST/PUT/PATCH (double-submit, httpOnly
      `__Host-` secret cookie), layered over the SameSite=Lax auth cookies. A
      client plugin (`plugins/csrf.client.ts`) echoes the token on same-origin
      mutations so no call site changes; machine callers (webhooks, Sentry
      tunnel) are excluded via `routeRules`. Verified: no-token POST → 403,
      valid token → passes, excluded routes reach their handler.
- [ ] **Passkeys / WebAuthn — deferred.** Needs a real authenticator device to
      verify; can't be validated headless. Wire when there's a device to test on.

**Acceptance:** rate limits hold across instances (Upstash); nonce CSP passes on
the real login flow; CSRF token enforced on mutations. ✅ Passkeys remain a
documented follow-up.

## Phase 6 — Data-layer option 💤

- [ ] Adopt Drizzle as a typed server-query layer **only if** server query
      complexity demands it — Supabase keeps owning schema + RLS ([ADR-0002](./adr/0002-data-layer.md)).

---

## Sequencing notes

- Phase 1 first: it's cheap and makes everything after it distributable.
- Phases 2–4 are the commercial-parity core; 2 before 4 so pricing has a home.
- Phase 5 is independent — pull it forward if you hit abuse or need a strict CSP.
