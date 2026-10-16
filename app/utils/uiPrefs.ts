// User preferences, synced on the profile via set_ui_prefs (the SQL function accepts the same keys and values).
// Pure, so normalising stored values is testable.

/** Brand colors a user can pick (html[data-accent] in layers/ui main.css); null = the app default. */
export const ACCENTS = ['amber', 'blue', 'indigo', 'violet', 'teal', 'emerald'] as const
export type Accent = (typeof ACCENTS)[number]
export const DEFAULT_ACCENT: Accent = 'amber'
/** Typefaces a user can pick (body + headings; html[data-font] in layers/ui main.css); null = the app default. */
export const FONTS = ['classic', 'plex', 'geist', 'source', 'manrope', 'nunito'] as const
export type Font = (typeof FONTS)[number]
export const DEFAULT_FONT: Font = 'classic'
/** Text size in percent of the browser's (html font-size, so everything in rem follows). */
export const TEXT_SIZES = [90, 100, 110, 125] as const
export type TextSize = (typeof TEXT_SIZES)[number]
/** Reduce motion: follow the device, always reduce, or always animate. */
export const MOTIONS = ['system', 'reduce', 'full'] as const
export type Motion = (typeof MOTIONS)[number]
export const CONTRASTS = ['normal', 'high'] as const
export type Contrast = (typeof CONTRASTS)[number]

export interface UiPrefs {
  locale: 'sr' | 'en' | null
  accent: Accent | null
  font: Font | null
  theme: 'system' | 'light' | 'dark'
  textSize: TextSize
  motion: Motion
  contrast: Contrast
  /** Off: an idle session is signed out after 30 minutes (plugins/idleLogout.client.ts). */
  staySignedIn: boolean
}

export const DEFAULT_UI_PREFS: UiPrefs = {
  locale: null,
  accent: null,
  font: null,
  theme: 'system',
  textSize: 100,
  motion: 'system',
  contrast: 'normal',
  staySignedIn: false,
}

const oneOf = <T>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback

/** Stored jsonb → complete, valid preferences (unknown or broken values fall back to the defaults). */
export function normalizePrefs(raw: unknown): UiPrefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const d = DEFAULT_UI_PREFS
  return {
    locale: oneOf(r.locale, ['sr', 'en'] as const, null),
    accent: oneOf(r.accent, ACCENTS, null),
    font: oneOf(r.font, FONTS, null),
    theme: oneOf(r.theme, ['system', 'light', 'dark'] as const, d.theme),
    textSize: oneOf(Number(r.textSize), TEXT_SIZES, d.textSize),
    motion: oneOf(r.motion, MOTIONS, d.motion),
    contrast: oneOf(r.contrast, CONTRASTS, d.contrast),
    staySignedIn: r.staySignedIn === true,
  }
}
