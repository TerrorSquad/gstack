# Docs site — backlog

Outstanding work on `site/`, in the order I'd do it. Captured during the
redesign so none of it gets re-derived later.

Priorities are about **order**, not importance: P0 unblocks or invalidates work
below it, P1 are correctness bugs, P2 is polish, P3 is new surface area.

---

## P0 — Cloudflare Pages migration — DONE, live at gstack.goranninkovic.com

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
| Build output directory | `dist` |
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

## P1 — Correctness — DONE

Both items landed together, because they had one cause: the designed pages had
no machine-readable description of themselves.

`app/utils/designedPages.ts` is now that description, and the single source for
**four** things previously separate or missing:

- the pages' own `<h1>` and section headings (via `SectionHead`)
- the search index (`app/components/app/AppSearch.vue`)
- `sitemap.xml` (the `nuxt.config.ts` hook reads `designedPagePaths`)
- title, description, canonical and OG image (`useDesignedPageSeo()`)

Changing a heading now changes the page, the search index and the sitemap
together.

### 1. Search — fixed

`UContentSearch` builds its groups by walking `navigation` and attaching
matching entries from `files`, so a page must be in **both** to be findable —
adding search sections alone would have done nothing. `AppSearch.vue` prepends a
synthetic "Product" navigation group and merges generated sections into `files`.

Verified by driving the real search UI: "RLS" → `/security`, "ten layers" →
`/architecture`, "batteries" → `/stack`, and section-level "known ceiling" →
`/security`.

### 2. OG images and canonicals — fixed

The pages called plain `useSeoMeta()`; docus's own pages call `useSeo()` +
`defineOgImage()`, which is where canonicals, Open Graph meta and JSON-LD come
from. `useDesignedPageSeo()` does the same. All three now emit a canonical at
the custom domain and a rendered OG image.

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
it with a real app screenshot once #8 lands.

### 6. Icons resolve at runtime, not build time

Every Cloudflare build logs dozens of `[Icon] failed to load icon`. Nuxt Icon is
in `remote` mode with one icon in the client bundle, so icons aren't inlined
into the prerendered HTML — the browser fetches them from the Iconify API. They
appear, but they pop in. Bundling the used set locally would fix it.

### 7. TOC entries truncate

"Type-safe end t...", "Batteries include...", "DX over clevern..." on the
introduction page. Docus's default aside width. Either shorten those headings or
widen the aside.

---

## P3 — New surface

### 8. Embed real app screenshots

`docs/screenshots/` is `pnpm screenshots` capturing the **starter app** — 42
images, both themes plus mobile. It's the strongest proof asset in the repo and
the docs site uses none of it.

**Blocked:** they're all still violet. Re-run `pnpm screenshots` from the repo
root with Supabase up (`pnpm supabase start`) to regenerate in amber, then copy
the handful worth showing into `site/public/`.

### 9. `/workbench` page

DX: the commands worth knowing, codegen (`db:types`, `gen:auth-templates`,
`gen:layer`), seeding, the pre-commit hook, and the CI gate list.

**Watch the overlap** — `pnpm setup` / `pnpm doctor` is already section 03 of
`/stack`, and "What CI won't let you break" is already a section on the landing.
Either this page absorbs those and they're cut from where they are, or it's not
worth a page. Decide before building.

### 10. `/compare` page

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
- Sitemap includes the designed pages, with absolute URLs.
- Deployed to Cloudflare Pages at gstack.goranninkovic.com.
- Designed pages are searchable and carry canonicals + OG images.
