# Docs site — backlog

Outstanding work on `site/`, in the order I'd do it. Captured during the
redesign so none of it gets re-derived later.

Priorities are about **order**, not importance: P0 unblocks or invalidates work
below it, P1 are correctness bugs, P2 is polish, P3 is new surface area.

---

## P0 — Move to Cloudflare Pages

Do this first: it changes `baseURL`, `site.url`, canonicals, OG image URLs and
the sitemap, so anything below that touches those would be redone. The pattern
to copy is `~/Projects/vue3/nuxt3-portfolio`, which already ships a Nuxt app to
Cloudflare Pages.

### Why

GitHub Pages forces `app.baseURL = '/gstack/'` because project sites are served
under the repo name. That one constraint causes most of the site's sharp edges:

- Every asset 404s in production if `baseURL` and the repo name disagree.
- `site.url` must carry the `/gstack` path, so `nuxt-site-config` warns on every
  build ("should not contain a path") — currently explained away in a comment
  rather than fixed.
- Canonicals, OG image URLs and the sitemap all have to be path-aware.

On a custom domain the site sits at `/` and all of it disappears. Cloudflare also
gives per-branch preview deploys, which Pages can't do for a subdirectory site.

### Domain

**`gstack.goranninkovic.com`.** `stack.goranninkovic.com` reads as "Goran's tech
stack" — a personal page — rather than a product name. Repo, wordmark, docs
title and URL should all say the same word. Keep `terrorsquad.github.io/gstack`
redirecting for a while; the README and social cards point at it.

### Steps

1. **Preset.** The site is fully prerendered, so uploading `nuxi generate` output
   as static assets is enough — `nitro.preset = 'cloudflare-pages'` is only
   needed if a server route ever has to run at the edge. Start static. What
   changes is the `--preset github_pages` flag in `package.json` → `build`.
2. **Drop the baseURL.** Remove `app.baseURL` and `app.buildAssetsDir`; set
   `site.url` to `https://gstack.goranninkovic.com`. This also silences the
   nuxt-site-config warning.
3. **`wrangler.toml`** at `site/`:
   ```toml
   name = "gstack-docs"
   pages_build_output_dir = ".output/public"
   compatibility_date = "2026-01-01"
   ```
4. **Workflow.** Replace `.github/workflows/pages.yml`. The portfolio uses
   `AdrianGonz97/refined-cf-pages-action@v1.3.0` with `CLOUDFLARE_API_TOKEN` and
   `CLOUDFLARE_ACCOUNT_ID` secrets — previews for non-`main`, production for
   `main`. Keep the `paths: site/**` trigger so app-only commits don't redeploy.
5. **Cache purge after publish.** Copy the portfolio's purge step *and its
   comment*. `/_nuxt/*` is served `immutable` for a year; if an edge node requests
   a chunk in the window between new HTML going live and assets finishing
   propagation, a 404 HTML page gets cached under a `.js` URL for a year and the
   site stops hydrating. Must be `continue-on-error: true` — the deploy has
   already succeeded by then.
6. **DNS.** CNAME `gstack` → the Pages project, proxied.
7. **Update inbound links.** Root `README.md`, `docs/social/README.md`, the OG
   image base, any `terrorsquad.github.io/gstack` references.

### Ride-along fix

`sitemap.xml` emits **relative** `<loc>` values (`/stack`, `/docs/...`), which is
invalid per the sitemap spec — they must be absolute. Docus's `inferSiteURL()`
returns empty at prerender. Check whether a path-free `site.url` fixes it on its
own; if not, fix it in the `prerender:generate` hook in `nuxt.config.ts` that
already post-processes the sitemap.

### Do not

Don't move the site into the root pnpm workspace to share deploy tooling. It's
standalone on purpose — someone cloning the starter must not inherit the docs
site's dependencies.

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

### 2. No OG images for the designed pages

`nuxt-og-image` auto-generates for content pages; the three Vue pages share the
site-wide default, so posting a link to `/security` gives a bare card. Add
`defineOgImage()` per page — the docs pages already show the shape to copy.

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
