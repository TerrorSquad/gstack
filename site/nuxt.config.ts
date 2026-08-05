import { fileURLToPath } from 'node:url'

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

  // Pages serves the repo at /<repo>/, not /. Both must carry the repo name or
  // every asset 404s in production while working fine on localhost.
  app: {
    baseURL: '/gstack/',
    buildAssetsDir: 'assets',
  },

  site: {
    // Keeps the /gstack path despite nuxt-site-config warning "should not
    // contain a path". That warning assumes a site at a domain root; this is a
    // Pages *project* site. Dropping the path emits canonicals at
    // /docs/... instead of /gstack/docs/..., i.e. URLs that 404. Verified both
    // ways against the built HTML.
    url: 'https://terrorsquad.github.io/gstack',
    name: 'GStack',
    description: 'An opinionated, RLS-first, type-safe Nuxt + Supabase stack for shipping multi-tenant SaaS.',
  },

  robots: {
    robotsTxt: false,
  },

  nitro: {
    hooks: {
      // Docus builds /sitemap.xml purely from @nuxt/content collections, so the
      // designed pages under app/pages/ (/stack, /architecture, /security) ship
      // unlisted. Appending here rather than replacing docus's route keeps us
      // off a second @nuxt/content instance just to enumerate three URLs.
      // Throws rather than silently no-oping if the output shape ever changes.
      'prerender:generate'(route) {
        if (route.route !== '/sitemap.xml' || !route.contents) return

        if (!route.contents.includes('</urlset>')) {
          throw new Error('sitemap.xml: no </urlset> to append to — docus changed its format')
        }

        const extra = ['/stack', '/architecture', '/security']
          .map(path => `  <url>\n    <loc>${path}</loc>\n  </url>\n`)
          .join('')

        route.contents = route.contents.replace('</urlset>', `${extra}</urlset>`)
      },
    },
  },


  compatibilityDate: '2025-08-04',
})
