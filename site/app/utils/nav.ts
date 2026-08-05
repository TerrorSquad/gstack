/**
 * Every route that exists as a Vue page rather than as content. The sitemap
 * route reads this too — @nuxt/content can't see these, so anything added here
 * has to be listed or it ships unlisted.
 */
export const STATIC_PAGES = ['/stack', '/architecture', '/security']

// Top-level product navigation, shared by the desktop header and the mobile
// menu so the two can't drift. Docs pages come from the content tree; these are
// the designed pages under app/pages/.
export const mainNav = [
  { label: 'Stack', to: '/stack', icon: 'i-lucide-package' },
  { label: 'Architecture', to: '/architecture', icon: 'i-lucide-layers' },
  { label: 'Security', to: '/security', icon: 'i-lucide-shield-check' },
  { label: 'Docs', to: '/docs/getting-started/introduction', icon: 'i-lucide-book-open' },
]
