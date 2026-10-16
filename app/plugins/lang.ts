// Apply the remembered language (cookie) before the first render, server and client alike.
export default defineNuxtPlugin(async (nuxtApp) => {
  const l = useCookie<string | null>('lang').value
  const i18n = nuxtApp.$i18n as {
    locale: { value: string }
    setLocale: (l: string) => Promise<void>
  }
  if ((l === 'sr' || l === 'en') && l !== i18n.locale.value) await i18n.setLocale(l)
})
