<script setup lang="ts">
definePageMeta({ public: true, layout: 'marketing' })

const { t } = useI18n()
const auth = useAuthStore()

useSeoMeta({
  title: () => t('landing.seoTitle'),
  description: () => t('landing.seoDescription'),
  ogTitle: () => t('landing.seoTitle'),
  ogDescription: () => t('landing.seoDescription'),
  twitterCard: 'summary_large_image',
})

// Feature cards — text via i18n (landing.features.<key>.title/body).
const features = [
  { key: 'auth', icon: 'i-lucide-shield-check' },
  { key: 'tenancy', icon: 'i-lucide-building-2' },
  { key: 'notifications', icon: 'i-lucide-bell' },
  { key: 'observability', icon: 'i-lucide-activity' },
  { key: 'i18n', icon: 'i-lucide-languages' },
  { key: 'testing', icon: 'i-lucide-flask-conical' },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-40"
      />
      <div class="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <p class="text-sm font-semibold tracking-wide text-primary uppercase">
          {{ $t('landing.heroEyebrow') }}
        </p>
        <h1 class="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-6xl">
          {{ $t('landing.heroTitle') }}
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-lg text-muted">
          {{ $t('landing.heroSubtitle') }}
        </p>
        <div class="mt-10 flex items-center justify-center gap-3">
          <UButton
            :to="auth.isAuthenticated ? '/dashboard' : '/register'"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ auth.isAuthenticated ? $t('nav.dashboard') : $t('landing.ctaPrimary') }}
          </UButton>
          <UButton to="/pricing" size="xl" variant="outline" color="neutral">
            {{ $t('landing.ctaSecondary') }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <h2 class="text-center font-heading text-3xl font-bold">{{ $t('landing.featuresTitle') }}</h2>
      <p class="mx-auto mt-3 max-w-2xl text-center text-muted">
        {{ $t('landing.featuresSubtitle') }}
      </p>
      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="f in features" :key="f.key">
          <div class="flex size-11 items-center justify-center rounded-lg bg-primary/10">
            <UIcon :name="f.icon" class="size-6 text-primary" />
          </div>
          <h3 class="mt-4 font-semibold">{{ $t(`landing.features.${f.key}.title`) }}</h3>
          <p class="mt-2 text-sm text-muted">{{ $t(`landing.features.${f.key}.body`) }}</p>
        </UCard>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div
        class="overflow-hidden rounded-2xl bg-linear-to-br from-primary-600 to-primary-800 px-8 py-16 text-center text-white"
      >
        <h2 class="font-heading text-3xl font-bold">{{ $t('landing.finalCtaTitle') }}</h2>
        <p class="mx-auto mt-3 max-w-xl text-white/80">{{ $t('landing.finalCtaBody') }}</p>
        <UButton
          :to="auth.isAuthenticated ? '/dashboard' : '/register'"
          size="xl"
          color="neutral"
          class="mt-8"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ auth.isAuthenticated ? $t('nav.dashboard') : $t('landing.finalCtaButton') }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dot-grid {
  background-image: radial-gradient(var(--ui-border) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at 50% 0%, black, transparent 70%);
}
</style>
