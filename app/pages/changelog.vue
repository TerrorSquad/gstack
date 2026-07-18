<script setup lang="ts">
import type { ChangelogEntry } from '~/utils/changelog'

definePageMeta({ public: true, layout: false })

const { t } = useI18n()
useHead({ title: () => t('changelog.title') })

function bucket(entry: ChangelogEntry, kind: 'feature' | 'fix') {
  return entry.highlights.filter((h) => h.kind === kind).map((h) => h.text)
}
</script>

<template>
  <div class="lg:flex">
    <div
      class="relative flex flex-col justify-between overflow-hidden bg-linear-to-br from-primary-600 to-primary-800 text-white lg:sticky lg:top-0 lg:h-screen lg:w-1/2"
    >
      <div class="flex items-center justify-between p-8">
        <AppLogo />
        <ThemeSwitcher />
      </div>
      <div class="flex flex-1 flex-col justify-center px-8 py-12">
        <h1 class="font-heading text-4xl font-extrabold drop-shadow-md">
          {{ $t('changelog.title') }}
        </h1>
        <p class="mt-3 max-w-sm text-white/85">{{ $t('changelog.subtitle') }}</p>
      </div>
      <div class="p-8">
        <ULink to="/" class="text-sm font-medium text-white/90 hover:text-white">
          &larr; {{ $t('changelog.back') }}
        </ULink>
      </div>
    </div>

    <div class="p-8 lg:w-1/2 lg:overflow-y-auto lg:p-16">
      <UChangelogVersions :indicator="false" :versions="CHANGELOG_ENTRIES">
        <!-- Feed the component the raw ISO date and format it ourselves; its
             `new Date(props.date)` misparses pre-formatted dates. -->
        <template #date="{ version }">
          {{ formatDate(version.date) }}
        </template>
        <template #body="{ version }">
          <div class="mt-5 space-y-6">
            <div
              v-for="group in [
                { kind: 'feature', icon: '✨', items: bucket(version, 'feature') },
                { kind: 'fix', icon: '🐞', items: bucket(version, 'fix') },
              ].filter((g) => g.items.length)"
              :key="group.kind"
            >
              <h3 class="mb-2 flex items-center gap-2 text-lg font-semibold text-highlighted">
                <span aria-hidden="true">{{ group.icon }}</span>
                {{ $t(`changelog.${group.kind}`) }}
              </h3>
              <ul class="list-outside list-disc space-y-1.5 pl-5 text-base/relaxed text-toned">
                <li v-for="text in group.items" :key="text">{{ text }}</li>
              </ul>
            </div>
          </div>
        </template>
      </UChangelogVersions>
    </div>
  </div>
</template>
