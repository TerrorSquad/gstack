<script setup lang="ts">
const { locale } = useI18n()

// a11y: <html lang> (html-has-lang) and a default document <title>
// (document-title). titleTemplate applies the app name to every page, and
// pages that set their own title get "— mojGO" appended.
useHead({
  htmlAttrs: { lang: () => (locale.value === 'en' ? 'en' : 'sr-Latn') },
  title: 'mojGO',
  titleTemplate: (title) => (title && title !== 'mojGO' ? `${title} - mojGO` : 'mojGO'),
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
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
