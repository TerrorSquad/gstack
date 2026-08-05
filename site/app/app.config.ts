export default defineAppConfig({
  ui: {
    // Amber matches --color-brand-* in layers/ui/app/assets/css/main.css, so the
    // docs site and the app you clone are recognisably the same product.
    colors: {
      primary: 'amber',
      neutral: 'slate',
      // Emerald is an accent, never a second brand: it marks "this is verified"
      // (passing gates, flags that need no third-party account) and nothing else.
      success: 'emerald',
    },
    // Mono, tracked-out eyebrows above every section title — the "system readout"
    // treatment. Done as component defaults rather than CSS so the markdown stays
    // plain `headline:` frontmatter and every section gets it for free.
    pageHero: {
      slots: {
        headline: 'mb-4 font-mono text-xs uppercase tracking-[0.18em]',
      },
    },
    pageSection: {
      slots: {
        headline: 'mb-3 font-mono text-xs uppercase tracking-[0.18em]',
      },
    },
  },
  header: {
    title: 'GStack',
  },
  // NOTE: no `github` key here. AppFooterRight renders socials.* AND github.url,
  // so listing GitHub in both puts the same icon in the footer twice.
  socials: {
    linkedin: 'https://www.linkedin.com/in/goran-ninkovic/',
  },
  github: {
    url: 'https://github.com/TerrorSquad/gstack',
    branch: 'main',
  },
  author: {
    name: 'Goran Ninkovic',
    url: 'https://goranninkovic.com/',
  },
})
