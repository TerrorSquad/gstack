<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

// Mirrors docus's own AppHeaderBody (the mobile menu) but prepends the
// top-level product nav — otherwise /architecture and /security are reachable
// on desktop only.
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <div class="flex flex-col gap-4">
    <nav class="flex flex-col gap-1">
      <UButton
        v-for="link in mainNav"
        :key="link.to"
        :to="link.to"
        :label="link.label"
        :icon="link.icon"
        color="neutral"
        variant="ghost"
        class="justify-start"
        active-class="text-highlighted"
      />
    </nav>

    <USeparator />

    <UContentNavigation
      :collapsible="false"
      :navigation="navigation"
      variant="link"
    />
  </div>
</template>
