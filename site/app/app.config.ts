export default defineAppConfig({
  ui: {
    // Violet matches --color-brand-* in layers/ui/app/assets/css/main.css, so the
    // docs site and the app you clone are recognisably the same product.
    colors: {
      primary: 'violet',
      neutral: 'slate',
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
