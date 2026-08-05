<script setup lang="ts">
// The numbered mono eyebrow + title pairing used on every designed page. Same
// treatment the landing gets from the pageSection slot override in app.config —
// this is the plain-Vue equivalent for pages that aren't markdown.
defineProps<{
  index: string
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="max-w-3xl">
    <p class="font-mono text-xs uppercase tracking-[0.18em] text-primary">
      {{ index }} — {{ eyebrow }}
    </p>
    <h2 class="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-highlighted">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-4 text-base sm:text-lg text-muted text-pretty"
    >
      {{ description }}
    </p>
  </div>
</template>
