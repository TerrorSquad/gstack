<script setup lang="ts">
const { locale } = useI18n()

// Canonical URL for every page (SEO): origin + path, no query/hash.
const requestUrl = useRequestURL()
const canonical = computed(() => `${requestUrl.origin}${requestUrl.pathname}`)

// a11y: <html lang> (html-has-lang) and a default document <title>
// (document-title). titleTemplate applies the app name to every page, and
// pages that set their own title get " · GStack" appended.
useHead({
  htmlAttrs: { lang: () => (locale.value === 'en' ? 'en' : 'sr-Latn') },
  title: 'GStack',
  titleTemplate: (title) => (title && title !== 'GStack' ? `${title} · GStack` : 'GStack'),
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'canonical', href: canonical },
  ],
})

// Site-wide default OG image: nuxt-og-image renders one per page from its <title>
// + site.name, so social/link previews work with zero art. Uses the ejected
// template at app/components/OgImage/NuxtSeo.satori.vue (community templates must
// be ejected to render in production). Override per page with
// defineOgImage('NuxtSeoSatori', { title, description }), or point at a
// static (e.g. AI-generated) image via defineOgImage({ url: '/og/home.png' }) —
// drop the file in public/og/.
defineOgImage('NuxtSeoSatori')
</script>

<template>
  <UApp :locale="UI_LOCALES[locale as 'en' | 'sr']">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <FeedbackWidget />
  </UApp>
</template>
