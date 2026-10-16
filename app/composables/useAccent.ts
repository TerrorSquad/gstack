import { ACCENTS, DEFAULT_ACCENT, type Accent } from '~/utils/uiPrefs'

// The brand color (<html data-accent>), in a cookie so the server render already has it; signed-in users sync it in ui_prefs.
export function useAccent() {
  const cookie = useCookie<string | null>('accent', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const accent = useState<Accent>('accent', () =>
    (ACCENTS as readonly unknown[]).includes(cookie.value)
      ? (cookie.value as Accent)
      : DEFAULT_ACCENT,
  )
  const set = (a: Accent) => {
    cookie.value = a
    accent.value = a
  }
  return { accent, set }
}
