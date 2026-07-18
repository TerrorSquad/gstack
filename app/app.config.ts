export default defineAppConfig({
  ui: {
    // Single design language (see DESIGN.md): thin border + soft shadow that
    // lifts slightly on hover, applied once globally via Nuxt UI's theme
    // system instead of repeating classes on every component instance.
    //
    // secondary maps to neutral - secondary actions render as plain
    // outline/white buttons, not a second brand color (see DESIGN.md).
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
      // Solid (primary) buttons: emerald fill, semibold, lift on hover, and a
      // 160px floor on non-icon sizes for high visibility (DESIGN.md).
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
      // Every UAlert instance in the app explicitly set variant="subtle"
      // (overriding Nuxt UI's own "solid" default) - make that the default
      // so it isn't repeated at every call site.
      defaultVariants: { variant: 'subtle' },
    },
    badge: {
      // Status/label chips (leave status, active/inactive, role, balances):
      // one variant everywhere instead of per-instance soft/subtle drift.
      // "soft" (tint, no ring) matches DESIGN.md's status chip spec.
      // Size is left at the Nuxt UI default (md) except where individual
      // instances override it for genuinely space-constrained contexts
      // (calendar day cells, org chart nodes).
      defaultVariants: {
        variant: 'soft',
      },
    },
  },
})
