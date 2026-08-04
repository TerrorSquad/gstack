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
  socials: {
    github: 'https://github.com/TerrorSquad/gstack',
  },
  github: {
    url: 'https://github.com/TerrorSquad/gstack',
    branch: 'main',
  },
})
