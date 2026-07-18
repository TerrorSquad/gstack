export default defineAppConfig({
  ui: {
    // One design language applied globally via Nuxt UI's theme system instead of
    // repeating classes on every instance: a thin border + crisp low shadow.
    // `primary` is the indigo brand; `secondary` maps to neutral so secondary
    // actions render as plain outline buttons, not a second brand color.
    colors: {
      primary: 'brand',
      secondary: 'neutral',
    },
    dashboardSidebar: {
      slots: {
        root: 'bg-elevated',
        content: 'bg-elevated', // mobile drawer panel
      },
    },
    card: {
      slots: { root: 'surface-border surface-shadow' },
      variants: {
        variant: {
          outline: { root: 'bg-elevated' },
        },
      },
    },
    button: {
      slots: { base: 'surface-border' },
      // Solid (primary) buttons: brand fill, semibold, shadow that lifts on hover.
      compoundVariants: [{ variant: 'solid', class: 'surface-shadow font-semibold' }],
    },
    input: {
      slots: { base: 'surface-border' },
    },
    textarea: {
      slots: { base: 'surface-border' },
    },
    selectMenu: {
      slots: { base: 'surface-border' },
    },
    alert: {
      slots: { root: 'surface-border' },
      // Default to the subtle variant everywhere instead of Nuxt UI's solid.
      defaultVariants: { variant: 'subtle' },
    },
    badge: {
      // One chip variant everywhere: soft (tint, no ring).
      defaultVariants: { variant: 'soft' },
    },
  },
})
