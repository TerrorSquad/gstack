# Docs site — backlog

Outstanding work on `site/`, in the order I'd do it. Captured during the
redesign so none of it gets re-derived later.

Priorities are about **order**, not importance: P0 unblocks or invalidates work
below it, P1 are correctness bugs, P2 is polish, P3 is new surface area.

---

## P0 — Cloudflare Pages migration — CODE DONE, awaiting first deploy

The code side is finished and merged. What remains is dashboard-only.

Deployed via **Cloudflare Pages' Git integration**, not GitHub Actions. The
portfolio uses Actions because its build is genuinely complex (Puppeteer PDF
generation, a PHP server); a static docs site needs none of that, so there is no
workflow file, no `wrangler.toml`, and no `CLOUDFLARE_*` secrets.

### Project settings (Cloudflare dashboard)

| Field | Value |
|---|---|
| Project name | `gstack` |
| Production branch | `main` |
| Framework preset | None — the Nuxt.js preset injects `npm run build` and `dist`, both wrong |
| Build command | `pnpm generate` |
| Build output directory | `.output/public` |
| Root directory | `site` |
| Env var | `NODE_VERSION=26` |

`Root directory` is the one that breaks things silently if missed: `site/` has
its own lockfile and `pnpm-workspace.yaml` so it resolves independently, and
leaving the path blank makes Cloudflare install the starter's deps and build the
wrong project. `NODE_VERSION` is needed because Cloudflare doesn't read
`mise.toml`.

### Remaining steps

1. Save and Deploy.
2. Custom domain → `gstack.goranninkovic.com`. The zone is already in this
   account, so Cloudflare writes the DNS record itself.
3. Build watch paths → `site/*`, replacing the old workflow's `paths: site/**`.
4. Decide what happens to `terrorsquad.github.io/gstack`. GitHub Pages will go
   stale now that `pages.yml` is deleted; either disable Pages in repo settings
   or leave the last build up as a dead end. Inbound links in `README.md` and
   `docs/social/README.md` already point at the new domain.

### Deliberately not ported

The portfolio's **cache-purge step**. It exists because that site actually hit a
race where a `/_nuxt/*` 404 got cached under an `immutable` header. Pages
deployments carry their own asset manifest, so the exposure isn't obviously the
same. Ship without it; add a small purge Action if it ever bites, rather than
porting a workaround for a problem this site may not have.

### Verify after the first deploy

Already verified locally against `pnpm generate` output — re-check on the real
deploy:

- No asset URL references `/gstack/`. (The 27 remaining occurrences are all
  `github.com/TerrorSquad/gstack/…` links, which are correct.)
- `sitemap.xml` `<loc>` values are absolute at the new origin. A path-free
  `site.url` did **not** fix this on its own — docus's `inferSiteURL()` still
  returned empty at prerender, so the `prerender:generate` hook now rewrites
  them and throws if a relative one survives.
- OG images and canonicals resolve at the new domain **on content pages**. The
  designed pages have neither — see P1 #2.

---

## P1 — Correctness

### 1. The designed pages aren't in site search

`/stack`, `/architecture` and `/security` live in `app/pages/`, and docus's
search indexes @nuxt/content collections only. Searching "RLS" does not surface
the security page. This is the biggest functional gap on the site.

Two ways out, pick one:

- **Move them into content** as `.md` with MDC components for the designed bits.
  Blocked by the collection shape: because `content/docs/` exists, docus scopes
  the `docs` collection to `docs/**` with a `/docs` prefix, so top-level markdown
  doesn't route at all. Would need a custom `content.config.ts` that redeclares
  docus's collections plus a marketing one — couples us to docus internals.
- **Feed the existing index**, by registering the three pages' headings into
  whatever `AppSearch` queries. Less invasive, needs a look at how docus builds
  `queryCollectionSearchSections`.

Prefer the second. Note the same fix removes the need for the manual
`STATIC_PAGES` list in `app/utils/nav.ts`.

### 2. Designed pages have no OG image and no canonical

Confirmed in the built output: `security.html` carries no `og:image` and no
`<link rel="canonical">`, while `docs/getting-started/introduction.html` has
both. Docus's `[...slug].vue` calls `useSeo()` and `defineOgImage()`; the Vue
pages only call `useSeoMeta()`, so they miss both.

Sharing `/stack`, `/architecture` or `/security` currently gives a bare card,
and the three pages are non-canonical — which matters more now that they're in
the sitemap. Add `defineOgImage()` and a canonical to each; copy the shape from
docus's slug page.

---

## P2 — Polish

### 3. Blue `info` alert is off-palette

`::note` / `info` renders Nuxt UI blue — the only blue pixel on the site, visible
on `/docs/getting-started/introduction`. Either remap `info` in the site's
`app.config.ts` or switch those callouts to `::tip`. Check the whole docs tree
for other `info` uses first.

### 4. Hero dead space

All three designed pages have a large gap between hero and section 01 — short
hero content against `py-20 sm:py-28` plus a section's `py-16 sm:py-24`. Tighten
the hero padding, or give the heroes something on the right (see #5).

### 5. Landing hero terminal is underweight

The install block is the most persuasive element on the landing page and it sits
small in a narrow right-hand column. Consider giving it more width, or replacing
it with a real app screenshot once #7 lands.

### 6. TOC entries truncate

"Type-safe end t...", "Batteries include...", "DX over clevern..." on the
introduction page. Docus's default aside width. Either shorten those headings or
widen the aside.

---

## P3 — New surface

### 7. Embed real app screenshots

`docs/screenshots/` is `pnpm screenshots` capturing the **starter app** — 42
images, both themes plus mobile. It's the strongest proof asset in the repo and
the docs site uses none of it.

**Blocked:** they're all still violet. Re-run `pnpm screenshots` from the repo
root with Supabase up (`pnpm supabase start`) to regenerate in amber, then copy
the handful worth showing into `site/public/`.

### 8. `/workbench` page

DX: the commands worth knowing, codegen (`db:types`, `gen:auth-templates`,
`gen:layer`), seeding, the pre-commit hook, and the CI gate list.

**Watch the overlap** — `pnpm setup` / `pnpm doctor` is already section 03 of
`/stack`, and "What CI won't let you break" is already a section on the landing.
Either this page absorbs those and they're cut from where they are, or it's not
worth a page. Decide before building.

### 9. `/compare` page

vs create-t3-app, vs commercial Nuxt SaaS kits — including where GStack loses.
`docs/gstack.md` already has the honest version; the introduction page has a
condensed table. Honest comparisons convert; a dishonest one is worse than none.

---

## Done during the redesign

- Amber brand swap, product-wide from `layers/ui` (app, emails, social cards).
- `/stack`, `/architecture`, `/security` designed pages.
- Landing rewritten around the isolation test, flag matrix and CI gates.
- Build-time Shiki highlighting in `CodeCard` (zero client bundle cost).
- Docs configuration table generated from `scripts/integrations.ts`; build fails
  if a subsystem has no site copy.
- Sitemap includes the designed pages.
