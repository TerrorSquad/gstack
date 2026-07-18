<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{ error: { statusCode: number; statusMessage?: string } }>()

const is404 = computed(() => props.error.statusCode === 404)
const title = computed(() => (is404.value ? t('error.404.title') : t('error.500.title')))
const description = computed(() =>
  is404.value ? t('error.404.description') : t('error.500.description'),
)
</script>

<template>
  <UApp>
    <div class="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <p class="text-8xl font-bold text-muted">{{ error.statusCode }}</p>
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold">{{ title }}</h1>
        <p class="text-muted">{{ description }}</p>
      </div>
      <UButton :label="t('error.goHome')" to="/dashboard" icon="i-lucide-house" />
    </div>
  </UApp>
</template>
