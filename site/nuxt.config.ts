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
    url: 'https://terrorsquad.github.io/gstack',
    name: 'GStack',
    description: 'An opinionated, RLS-first, type-safe Nuxt + Supabase stack for shipping multi-tenant SaaS.',
  },

  robots: {
    robotsTxt: false,
  },

  compatibilityDate: '2025-08-04',
})
