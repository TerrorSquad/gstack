import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The design-system layer — the single source of truth for look & feel: theme
// tokens + the WCAG-AA overrides (app/assets/css/main.css), the Nuxt UI component
// defaults (app/app.config.ts), the brand fonts, and the brand chrome (AppLogo,
// ThemeSwitcher). Every app extends THIS instead of copying tokens around, so a
// marketing/app/docs split can't drift. See DESIGN.md and ADR-0005.
//
// `~` resolves to the consuming app's root (not this layer), so the CSS path is
// resolved absolutely off this file's location.
const dir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  css: [join(dir, 'app/assets/css/main.css')],
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'Space Grotesk', provider: 'google' },
    ],
  },
})
