<script setup lang="ts">
const { locale } = useI18n()

// a11y: <html lang> (html-has-lang) and a default document <title>
// (document-title). titleTemplate applies the app name to every page, and
// pages that set their own title get " · Starter" appended.
useHead({
  htmlAttrs: { lang: () => (locale.value === 'en' ? 'en' : 'sr-Latn') },
  title: 'Starter',
  titleTemplate: (title) => (title && title !== 'Starter' ? `${title} · Starter` : 'Starter'),
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
