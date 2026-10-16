// Apply synced preferences whenever the signed-in profile (and so its ui_prefs) changes: language, theme, look.
export default defineNuxtPlugin((nuxtApp) => {
  const { prefs } = useUiPrefs()
  const auth = useAuthStore()
  const colorMode = useColorMode()
  const accent = useAccent()
  const font = useFont()
  const display = useDisplay()
  const lang = useCookie<string | null>('lang', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const i18n = nuxtApp.$i18n as {
    locale: { value: string }
    setLocale: (l: string) => Promise<void>
  }
  watch(
    () => auth.profile?.uiPrefs,
    () => {
      if (!auth.profile) return
      const p = prefs.value
      if (p.locale && p.locale !== i18n.locale.value) {
        lang.value = p.locale
        void i18n.setLocale(p.locale)
      }
      if (colorMode.preference !== p.theme) colorMode.preference = p.theme
      if (p.accent && p.accent !== accent.accent.value) accent.set(p.accent)
      if (p.font && p.font !== font.font.value) font.set(p.font)
      // only a saved choice overrides this device's cookie
      const raw = auth.profile.uiPrefs
      if (raw.textSize != null) display.textSize.set(p.textSize)
      if (raw.motion != null) display.motion.set(p.motion)
      if (raw.contrast != null) display.contrast.set(p.contrast)
    },
    { immediate: true, deep: true },
  )
})
