<script setup lang="ts">
const { locale } = useI18n()

// Canonical URL for every page (SEO): origin + path, no query/hash.
const requestUrl = useRequestURL()
const canonical = computed(() => `${requestUrl.origin}${requestUrl.pathname}`)

// a11y: <html lang> (html-has-lang) and a default document <title>
// (document-title). titleTemplate applies the app name to every page, and
// pages that set their own title get " · Starter" appended.
useHead({
  htmlAttrs: { lang: () => (locale.value === 'en' ? 'en' : 'sr-Latn') },
  title: 'Starter',
  titleTemplate: (title) => (title && title !== 'Starter' ? `${title} · Starter` : 'Starter'),
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'canonical', href: canonical },
  ],
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
