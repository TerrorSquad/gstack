<script setup lang="ts">
// PLANS + formatPrice are auto-imported (marketing layer + root app/utils).

// Billing management is a tenant-admin concern.
definePageMeta({ roles: ['admin'] })

const { t, locale } = useI18n()
const toast = useToast()
useHead({ title: () => t('nav.billing') })

const { billingEnabled } = useRuntimeConfig().public
const { plan } = useSubscription()

const busy = ref('')
async function checkout(planId: string) {
  busy.value = planId
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/checkout', {
      method: 'POST',
      body: { plan: planId },
    })
    window.location.assign(url)
  } catch (e) {
    toast.add({ title: (e as { data?: { message?: string } })?.data?.message ?? t('common.saveError'), color: 'error' })
    busy.value = ''
  }
}
async function manage() {
  busy.value = 'portal'
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST' })
    window.location.assign(url)
  } catch (e) {
    toast.add({ title: (e as { data?: { message?: string } })?.data?.message ?? t('common.saveError'), color: 'error' })
    busy.value = ''
  }
}

function price(p: (typeof PLANS)[number]) {
  if (p.priceMonthly === 0) return t('pricing.free')
  return formatPrice(p.priceMonthly, 'USD', locale.value === 'sr' ? 'sr-Latn' : 'en-US')
}
</script>

<template>
  <UContainer class="max-w-3xl py-8">
    <h1 class="text-2xl font-bold">{{ $t('billing.title') }}</h1>
    <p class="mt-1 text-muted">{{ $t('billing.subtitle') }}</p>

    <UAlert
      v-if="!billingEnabled"
      class="mt-6"
      color="warning"
      icon="i-lucide-triangle-alert"
      :title="$t('billing.disabledTitle')"
      :description="$t('billing.disabledBody')"
    />

    <UCard class="mt-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted">{{ $t('billing.currentPlan') }}</p>
          <p class="text-xl font-bold capitalize">{{ $t(`pricing.plan.${plan}.name`) }}</p>
        </div>
        <UButton
          v-if="plan !== 'free'"
          variant="outline"
          color="neutral"
          :loading="busy === 'portal'"
          @click="manage"
        >
          {{ $t('billing.manage') }}
        </UButton>
      </div>
    </UCard>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <UCard v-for="p in PLANS" :key="p.id" :class="p.id === plan ? 'ring-2 ring-primary' : ''">
        <p class="font-semibold">{{ $t(`pricing.plan.${p.id}.name`) }}</p>
        <p class="mt-2 text-2xl font-bold">
          {{ price(p) }}
          <span v-if="p.priceMonthly > 0" class="text-sm font-normal text-muted">
            {{ $t('pricing.perMonth') }}
          </span>
        </p>
        <UButton
          v-if="p.id !== plan && p.priceMonthly > 0"
          block
          class="mt-4"
          :loading="busy === p.id"
          :disabled="!billingEnabled"
          @click="checkout(p.id)"
        >
          {{ $t('billing.choosePlan') }}
        </UButton>
        <UBadge v-else-if="p.id === plan" class="mt-4" color="primary" variant="soft">
          {{ $t('billing.currentPlan') }}
        </UBadge>
      </UCard>
    </div>
  </UContainer>
</template>
