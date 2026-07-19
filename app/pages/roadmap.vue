<script setup lang="ts">
import type { RoadmapStatus } from '~/utils/roadmap'

// Public marketing page — sits in the site header/footer chrome, unlike the
// changelog's standalone split-hero.
definePageMeta({ public: true, layout: 'marketing' })

const { t } = useI18n()
useHead({ title: () => t('roadmap.title') })

// Board columns, left-to-right in flow order. `key` maps the kebab status onto
// its camelCase i18n key (roadmap.inProgress).
const columns: { status: RoadmapStatus; icon: string; color: string }[] = [
  { status: 'planned', icon: 'i-lucide-circle-dashed', color: 'text-muted' },
  { status: 'in-progress', icon: 'i-lucide-loader', color: 'text-primary' },
  { status: 'shipped', icon: 'i-lucide-circle-check', color: 'text-success' },
]
const key = (s: RoadmapStatus) => (s === 'in-progress' ? 'inProgress' : s)
const items = (status: RoadmapStatus) => ROADMAP_ITEMS.filter((i) => i.status === status)
</script>

<template>
  <UContainer class="max-w-6xl py-12">
    <div class="max-w-2xl">
      <h1 class="font-heading text-3xl font-extrabold sm:text-4xl">{{ $t('roadmap.title') }}</h1>
      <p class="mt-3 text-lg text-muted">{{ $t('roadmap.subtitle') }}</p>
    </div>

    <div class="mt-10 grid gap-6 md:grid-cols-3">
      <section v-for="col in columns" :key="col.status">
        <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
          <UIcon :name="col.icon" :class="['size-4', col.color]" />
          {{ $t(`roadmap.${key(col.status)}`) }}
        </h2>
        <ul class="space-y-3">
          <li v-for="item in items(col.status)" :key="item.title">
            <UCard :ui="{ body: 'p-4 sm:p-4' }">
              <p class="font-medium text-highlighted">{{ item.title }}</p>
              <p v-if="item.description" class="mt-1 text-sm text-toned">{{ item.description }}</p>
            </UCard>
          </li>
          <li v-if="!items(col.status).length" class="text-sm text-muted">—</li>
        </ul>
      </section>
    </div>
  </UContainer>
</template>
