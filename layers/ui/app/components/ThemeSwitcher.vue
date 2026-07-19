<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UTooltip :text="$t('theme.label')">
    <UButton
      :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
      size="xs"
      variant="ghost"
      color="neutral"
      :aria-label="$t('theme.label')"
      @click="toggleColorMode"
    />
  </UTooltip>
</template>
