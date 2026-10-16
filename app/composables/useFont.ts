import { DEFAULT_FONT, FONTS, type Font } from '~/utils/uiPrefs'

// The typeface (<html data-font>), in a cookie so the server render already has it; signed-in users sync it in ui_prefs.
export function useFont() {
  const cookie = useCookie<string | null>('font', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const font = useState<Font>('font', () =>
    (FONTS as readonly unknown[]).includes(cookie.value) ? (cookie.value as Font) : DEFAULT_FONT,
  )
  const set = (f: Font) => {
    cookie.value = f
    font.value = f
  }
  return { font, set }
}
