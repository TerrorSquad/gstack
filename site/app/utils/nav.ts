// Top-level product navigation, shared by the desktop header and the mobile
// menu so the two can't drift. Docs pages come from the content tree; these are
// the designed pages under app/pages/.
export const mainNav = [
  { label: 'Screens', to: '/screens', icon: 'i-lucide-image' },
  { label: 'Stack', to: '/stack', icon: 'i-lucide-package' },
  { label: 'Architecture', to: '/architecture', icon: 'i-lucide-layers' },
  { label: 'Security', to: '/security', icon: 'i-lucide-shield-check' },
  { label: 'Compare', to: '/compare', icon: 'i-lucide-scale' },
  { label: 'Docs', to: '/docs/getting-started/introduction', icon: 'i-lucide-book-open' },
]
