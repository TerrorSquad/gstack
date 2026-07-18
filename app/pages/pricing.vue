<script setup lang="ts">
import { PLANS } from '~/utils/plans'
import { formatPrice } from '~/utils/formatNumber'

definePageMeta({ public: true, layout: 'marketing' })

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('pricing.seoTitle'),
  description: () => t('pricing.seoDescription'),
  ogTitle: () => t('pricing.seoTitle'),
  ogDescription: () => t('pricing.seoDescription'),
  twitterCard: 'summary_large_image',
})

function price(p: (typeof PLANS)[number]) {
  if (p.priceMonthly === 0) return t('pricing.free')
  return formatPrice(p.priceMonthly, 'USD', locale.value === 'sr' ? 'sr-Latn' : 'en-US')
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
    <div class="text-center">
      <h1 class="font-heading text-4xl font-extrabold tracking-tight">{{ $t('pricing.title') }}</h1>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-muted">{{ $t('pricing.subtitle') }}</p>
    </div>

    <div class="mt-14 grid items-start gap-6 lg:grid-cols-3">
      <UCard
        v-for="plan in PLANS"
        :key="plan.id"
        :class="plan.highlighted ? 'ring-2 ring-primary' : ''"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ $t(`pricing.plan.${plan.id}.name`) }}</h2>
          <UBadge v-if="plan.highlighted" color="primary">{{ $t('pricing.mostPopular') }}</UBadge>
        </div>
        <p class="mt-1 text-sm text-muted">{{ $t(`pricing.plan.${plan.id}.tagline`) }}</p>

        <div class="mt-6 flex items-baseline gap-1">
          <span class="text-4xl font-bold">{{ price(plan) }}</span>
          <span v-if="plan.priceMonthly > 0" class="text-sm text-muted">
            {{ $t('pricing.perMonth') }}
          </span>
        </div>

        <UButton
          to="/register"
          block
          size="lg"
          class="mt-6"
          :variant="plan.highlighted ? 'solid' : 'outline'"
          :color="plan.highlighted ? 'primary' : 'neutral'"
        >
          {{ $t('pricing.cta') }}
        </UButton>

        <ul class="mt-6 flex flex-col gap-3">
          <li
            v-for="key in plan.featureKeys"
            :key="key"
            class="flex items-start gap-2 text-sm"
          >
            <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{{ $t(`pricing.feature.${key}`) }}</span>
          </li>
        </ul>
      </UCard>
    </div>

    <p class="mt-10 text-center text-sm text-muted">{{ $t('pricing.footnote') }}</p>
  </div>
</template>
