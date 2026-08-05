<script setup lang="ts">
// Overrides docus's header centre (which is search-only) to add the top-level
// product nav. The designed pages live in app/pages/, so they're invisible to
// the content-driven navigation docus builds — they have to be listed here.
</script>

<template>
  <div class="flex items-center gap-2 w-full">
    <nav class="hidden lg:flex items-center gap-1">
      <UButton
        v-for="link in mainNav"
        :key="link.to"
        :to="link.to"
        :label="link.label"
        color="neutral"
        variant="ghost"
        size="sm"
        active-class="text-highlighted"
      />
    </nav>

    <UContentSearchButton
      :collapsed="false"
      class="ms-auto w-full max-w-64 hidden lg:flex"
      variant="soft"
      :ui="{ leadingIcon: 'size-4 mx-0.5' }"
    />
  </div>
</template>
