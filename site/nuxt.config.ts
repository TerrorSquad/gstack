import { fileURLToPath } from 'node:url'

import { designedPagePaths } from './app/utils/designedPages'

const SITE_URL = 'https://gstack.goranninkovic.com'

// Routes that exist as Vue pages rather than content. @nuxt/content can't see
// them, so docus's sitemap route misses them — see the nitro hook below.
// Imported rather than repeated: app/utils/designedPages.ts is the one place
// these pages are described, for the sitemap, search, SEO and the pages
// themselves.

// Standalone Nuxt project — deliberately NOT part of the root app or its
// pnpm workspace. It has its own lockfile and node_modules so the starter you
// clone never carries the docs site's dependencies.
//
// https://github.com/nuxt-themes/docus
export default defineNuxtConfig({
  extends: ['docus'],

  devtools: { enabled: true },

  // The starter's subsystem manifest — the same file pnpm setup and pnpm doctor
  // read. The docs table and /stack derive their FACTS from it (flag names,
  // categories, which keys are required) so they can't drift the way the
  // hand-maintained table did. It lives outside this project on purpose: the
  // site is standalone, but it documents the repo it sits in.
  alias: {
    '#manifest': fileURLToPath(new URL('../scripts/integrations.ts', import.meta.url)),
  },

  vite: {
    // The alias points above the site root, which Vite's dev server blocks by default.
    server: { fs: { allow: ['..'] } },
  },

  // No app.baseURL: the site is served from the root of its own domain.
  //
  // It used to be '/gstack/' because GitHub Pages serves project sites under the
  // repo name, which forced the path into site.url too and made canonicals, OG
  // image URLs and the sitemap all path-aware. Moving to a custom domain on
  // Cloudflare Pages deletes that entire class of problem — don't reintroduce a
  // baseURL without also putting the path back in site.url.

  site: {
    url: SITE_URL,
    name: 'GStack',
    description: 'An opinionated, RLS-first, type-safe Nuxt + Supabase stack for shipping multi-tenant SaaS.',
  },

  robots: {
    robotsTxt: false,
  },

  // Docus leaves Nuxt Icon on the remote Iconify API, so every build logged
  // dozens of "[Icon] failed to load icon" and the prerendered HTML shipped
  // without them — icons only appeared once the browser fetched them, so they
  // popped in. With the collections installed as devDependencies, the local
  // server bundle resolves them during prerender and they're inlined instead.
  icon: {
    provider: 'server',
    serverBundle: {
      collections: ['lucide', 'simple-icons', 'vscode-icons'],
    },
  },

  nitro: {
    // Pinned so the output directory is the SAME everywhere. Left unset, Nitro
    // sniffs the environment: `static` locally (-> .output/public) but
    // `cloudflare-pages-static` on Pages (-> dist). The first deploy built fine
    // and then failed on "Output directory site/.output/public not found",
    // because the dashboard was configured for the local path.
    //
    // This preset also emits dist/_headers and dist/_redirects, which is why
    // it's the one to standardise on rather than forcing plain `static`.
    // Cloudflare's "Build output directory" must be `dist`.
    preset: 'cloudflare-pages-static',

    hooks: {
      // Two fixes to docus's /sitemap.xml, which it builds purely from
      // @nuxt/content collections:
      //
      // 1. The designed pages under app/pages/ aren't content, so they ship
      //    unlisted. Appending here — rather than replacing docus's route —
      //    avoids pinning a second @nuxt/content instance just to list three URLs.
      // 2. Docus emits RELATIVE <loc> values because its inferSiteURL() returns
      //    empty during prerender. The sitemap spec requires absolute URLs, so
      //    every entry gets the origin prefixed.
      //
      // Both throw rather than silently no-op if docus changes its output shape.
      'prerender:generate'(route) {
        if (route.route !== '/sitemap.xml' || !route.contents) return

        if (!route.contents.includes('</urlset>')) {
          throw new Error('sitemap.xml: no </urlset> to append to — docus changed its format')
        }

        const extra = designedPagePaths
          .map(path => `  <url>\n    <loc>${path}</loc>\n  </url>\n`)
          .join('')

        route.contents = route.contents
          .replace('</urlset>', `${extra}</urlset>`)
          .replace(/<loc>(\/[^<]*)<\/loc>/g, `<loc>${SITE_URL}$1</loc>`)

        if (route.contents.includes('<loc>/')) {
          throw new Error('sitemap.xml: relative <loc> survived the rewrite')
        }
      },
    },
  },


  compatibilityDate: '2025-08-04',
})
