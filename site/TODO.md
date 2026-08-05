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

## P2 — Polish — DONE

3, 4, 6 and 7 all fixed and verified by `pnpm screenshots`, which now asserts
no console errors, no horizontal overflow and no clipped text on every page in
both themes.

- **Blue `info` alert** → mapped to neutral. success/warning/error keep meaning
  something; notes are quiet.
- **Hero dead space** → heroes are `pt-16 pb-12 sm:pt-24 sm:pb-16`.
- **Icons** → collections are devDependencies bundled locally. Verified: zero
  external requests, icons painted from inline data URIs, no build warnings.
- **TOC truncation** → the slot is on `contentToc`, not `pageAnchors` (the first
  attempt silently did nothing; the screenshot check caught it). Entries wrap.

### 5. Landing hero terminal — resolved differently

Rather than restyle it, the landing gained a "What it looks like" section
(§02) leading into /screens. The terminal keeps its slot; the product is now
visible above the fold's fold, which was the actual problem.

---

## P3 — DONE

- **8. App screenshots** — regenerated in amber and surfaced at **/screens**
  (signed-in surface, public pages, mobile, with a theme toggle). Also fixed
  the portfolio's project image, which was still the violet dashboard.
- **9. /workbench** — dropped; it would have restated /stack §03 and the
  landing's CI table.
- **10. /compare** — shipped, with an "Edge" column allowed to say *They lead*.

---

## Known operational quirk

Cloudflare Pages briefly serves **edge-cached HTML from the previous deploy**
after a push, so for a minute or two some pages reference `_nuxt` chunks the new
deployment no longer contains, and hydration on those pages fails.

Observed directly during this work — it is the same race the portfolio's
cache-purge step exists to close, and the reason that step was written. It
converges on its own within a couple of minutes.

If it ever matters (a demo, a launch), port the purge: a small GitHub Action on
`main` hitting the zone purge endpoint with `continue-on-error: true`, exactly
as `nuxt3-portfolio/.github/workflows/build-and-deploy.yml` does. Verify with:

```bash
# every chunk referenced by a page should resolve
curl -s https://gstack.goranninkovic.com/ | grep -oE '/_nuxt/[^"]+\.js' \
  | xargs -I{} curl -s -o /dev/null -w '%{http_code} {}\n' https://gstack.goranninkovic.com{}
```

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
- `pnpm screenshots` for the docs site, with 26 committed captures.
- /compare, including where GStack loses.
