<script setup lang="ts">
import type { ChangelogEntry } from '~/utils/changelog'

// Public page in the site chrome — a centered timeline feed, not a standalone hero.
definePageMeta({ public: true, layout: 'marketing' })

const { t } = useI18n()
useHead({ title: () => t('changelog.title') })

function bucket(entry: ChangelogEntry, kind: 'feature' | 'fix') {
  return entry.highlights.filter((h) => h.kind === kind).map((h) => h.text)
}
</script>

<template>
  <UContainer class="max-w-3xl py-12 sm:py-16">
    <header class="max-w-2xl">
      <h1 class="font-heading text-3xl font-extrabold sm:text-4xl">{{ $t('changelog.title') }}</h1>
      <p class="mt-3 text-lg text-muted">{{ $t('changelog.subtitle') }}</p>
    </header>

    <ol class="relative mt-12 ms-3 space-y-14 border-s border-default sm:ms-4">
      <li v-for="entry in CHANGELOG_ENTRIES" :key="entry.date" class="relative ps-8 sm:ps-10">
        <span
          class="absolute top-1.5 -start-[7px] size-3.5 rounded-full bg-primary ring-4 ring-(--ui-bg)"
          aria-hidden="true"
        />
        <time class="text-sm font-medium text-muted">{{ formatDate(entry.date) }}</time>
        <h2 class="mt-1 font-heading text-2xl font-bold text-highlighted">{{ entry.title }}</h2>

        <div class="mt-5 space-y-6">
          <div
            v-for="group in [
              { kind: 'feature', icon: 'i-lucide-sparkles', items: bucket(entry, 'feature') },
              { kind: 'fix', icon: 'i-lucide-bug', items: bucket(entry, 'fix') },
            ].filter((g) => g.items.length)"
            :key="group.kind"
          >
            <h3
              class="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-toned uppercase"
            >
              <UIcon :name="group.icon" class="size-4 text-primary" />
              {{ $t(`changelog.${group.kind}`) }}
            </h3>
            <ul class="space-y-2">
              <li
                v-for="text in group.items"
                :key="text"
                class="flex gap-2.5 text-base/relaxed text-toned"
              >
                <UIcon name="i-lucide-check" class="mt-1.5 size-3.5 shrink-0 text-muted" />
                <span>{{ text }}</span>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ol>
  </UContainer>
</template>
