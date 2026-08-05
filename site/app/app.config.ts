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
      // ::note callouts default to Nuxt UI's blue `info`, which was the only
      // blue on an amber/slate site. Neutral keeps them quiet and on-palette,
      // and leaves success/warning/error as the colours that still mean something.
      info: 'slate',
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
    // The "On this page" aside truncates every entry to one line, so headings
    // read as "Type-safe end t…" and "Batteries include…". Let them wrap —
    // a two-line entry is far more useful than an ellipsis. The slot lives on
    // UContentToc (contentToc), not UPageAnchors.
    contentToc: {
      slots: {
        linkText: 'whitespace-normal',
        link: 'group relative text-sm flex items-start rounded-sm outline-primary/25 focus-visible:outline-3 py-1',
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
