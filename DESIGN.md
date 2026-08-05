# DESIGN.md

The design system for this starter, in one place — for humans and for AI tools
generating UI. If you're building or restyling a component, read this first, then
change **tokens**, not one-off classes.

## Where the design lives (change here, it cascades everywhere)

The design system is a dedicated **`layers/ui`** layer — the single source of truth
every app extends, so a marketing/app/docs split can't drift (see ADR-0005). Its
three files own the look:

- **`layers/ui/app/assets/css/main.css`** — the brand color ramp, surface tokens
  (bg/border/shadow/radius), and the light/dark theming + accessibility overrides.
- **`layers/ui/app/app.config.ts`** — Nuxt UI global component defaults (variants
  applied to every `UCard`, `UButton`, `UAlert`, … so we don't repeat classes).
- **`layers/ui/nuxt.config.ts`** → `fonts` — the two Google fonts (Inter, Space
  Grotesk) + the CSS registration.

Brand chrome (`AppLogo.vue`, `ThemeSwitcher.vue`) lives in `layers/ui/app/components/`
and auto-imports everywhere. A page should almost never introduce a color, shadow,
or radius of its own — reach for the token/utility instead.

## Foundations

### Color
- **Brand** is an amber ramp `--color-brand-50…950` mapped to Nuxt UI's
  `primary` (`app.config.ts`). Use `primary`/`text-primary`/`bg-primary` — never a
  raw brand hex in a component.
- Brand amber sits near Nuxt UI's default `warning` (yellow). That's tolerable
  because alerts carry an icon and text, never colour alone — but don't add a
  colour-only status indicator that leans on telling the two apart.
- `secondary` maps to **neutral** on purpose: secondary actions render as plain
  outline buttons, not a second brand color.
- Semantic colors: `success` / `warning` / `error` — use these, not green/amber/red.
- **Surfaces** are cool slate: `--ui-bg`, `--ui-bg-elevated`, `--ui-bg-muted`,
  `--ui-border`. Use `bg-default` / `bg-elevated` / `bg-muted` / `border-default`
  and the text roles `text-default` / `text-muted` / `text-toned` /
  `text-highlighted`.

### The accessibility contract (do not undo this)
Nuxt UI's default `-500` colored text and dimmed/muted neutrals sit **below WCAG
AA** on white. `main.css` redirects `.text-primary/success/warning/error` to a
darker step and darkens solid button fills in light mode. Two rules follow:
1. Don't "fix" a color by hardcoding a lighter hex — you'll reintroduce the AA
   failure the overrides exist to prevent.
2. **The fill step depends on the hue.** Warm mid-tone ramps (amber, teal,
   emerald, cyan, orange) are too light at `-600` for white text: amber-600 is
   3.0:1 and fails, amber-700 is 5.0:1 and passes, which is why the
   `:is(button, a).bg-primary` override targets `-700`. Cool ramps
   (indigo/violet/blue/rose) pass at `-600`. If you rebrand, measure your fill
   step against white before shipping and move the override to match — that one
   rule is the whole contract.

### Typography
- Body: **Inter** (`--font-sans`). Headings: **Space Grotesk** (`--font-heading`),
  applied to `h1/h2/h3` and `.font-heading`, with `-0.01em` tracking.
- Inputs are `≥16px` on mobile (prevents iOS focus-zoom) — don't shrink them below.

### Shape & depth
- Radius: `--ui-radius` (`0.625rem`). Use `rounded-(--ui-radius)`; don't invent
  per-component radii.
- Elevation is **one system**: `.surface-border` (1px token border) + `.surface-shadow`
  (crisp low shadow that lifts to a brand-tinted glow on hover). No new shadow
  scales, no `scale-*` transform hovers — the shadow *is* the hover feedback.

## Component conventions (Nuxt UI v4)

Global defaults already set in `app.config.ts` — you get them for free:
- `UCard` → `surface-border surface-shadow`; `variant="outline"` sits on `bg-elevated`.
- `UButton` (solid) → brand fill, `font-semibold`, lifting shadow.
- `UAlert` → `subtle` variant by default (tint, no loud solid).
- `UBadge` → `soft` (tint, no ring).

So: build with `UCard`/`UButton`/`UAlert`/`UInput`/`UBadge` and let the defaults do
the work. Override a slot only for a genuinely new pattern, and prefer adding it to
`app.config.ts` if it should be global.

## Dark mode & i18n are not optional
- **Both themes are first-class.** The `a11y` Playwright project runs axe against
  light *and* dark — test both, and use tokens (which flip automatically) rather
  than fixed colors.
- Every user-facing string is an i18n key in **both** `i18n/locales/{en,sr}.json`
  (flat dot-keys), then `pnpm lint:i18n`. No hardcoded copy.

## Rebranding
Everything below is in `layers/ui` — change it once, every app inherits it:
1. Swap the 11 `--color-brand-*` hexes in `layers/ui/app/assets/css/main.css` (use a
   vetted ramp, e.g. Tailwind's) — keep it a dark-ramp hue (see the AA contract) or
   re-tune the overrides.
2. Update the brand-tinted hover glow rgba in `--surface-shadow-hover` to the new
   `-600` color.
3. Swap fonts in `layers/ui/nuxt.config.ts` if desired.
4. Replace the OG default and favicon (`public/favicon.svg`,
   `layers/ui/app/components/AppLogo.vue`).

That's the whole surface. Change tokens, keep the AA contract, test both themes.
