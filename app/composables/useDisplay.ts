import {
  CONTRASTS,
  MOTIONS,
  TEXT_SIZES,
  type Contrast,
  type Motion,
  type TextSize,
} from '~/utils/uiPrefs'

// Text size, motion and contrast (<html data-text-size / data-motion / data-contrast>), in cookies like the typeface
// so the server render already has them; signed-in users sync them in ui_prefs.
function cookiePref<T extends string | number>(name: string, allowed: readonly T[], fallback: T) {
  const cookie = useCookie<string | null>(name, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const value = useState<T>(
    name,
    () => allowed.find((a) => String(a) === String(cookie.value)) ?? fallback,
  )
  const set = (v: T) => {
    cookie.value = String(v)
    value.value = v
  }
  return { value, set }
}

export function useDisplay() {
  return {
    textSize: cookiePref<TextSize>('textSize', TEXT_SIZES, 100),
    motion: cookiePref<Motion>('motion', MOTIONS, 'system'),
    contrast: cookiePref<Contrast>('contrast', CONTRASTS, 'normal'),
  }
}
