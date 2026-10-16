// The chosen language, kept in a cookie so it holds before login and in the server render (the default locale when unset).
// Signed-in users also sync it in ui_prefs, which wins once the profile loads.
export function useLang() {
  const { locale, setLocale } = useI18n()
  const cookie = useCookie<string | null>('lang', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const set = async (l: 'sr' | 'en') => {
    cookie.value = l
    await setLocale(l)
  }
  const other = computed(() => (locale.value === 'sr' ? 'en' : 'sr'))
  return { locale, set, other }
}
