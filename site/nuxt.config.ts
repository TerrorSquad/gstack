// Standalone Nuxt project — deliberately NOT part of the root app or its
// pnpm workspace. It has its own lockfile and node_modules so the starter you
// clone never carries the docs site's dependencies.
//
// https://github.com/nuxt-themes/docus
export default defineNuxtConfig({
  extends: ['docus'],

  devtools: { enabled: true },

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

  compatibilityDate: '2025-08-04',
})
