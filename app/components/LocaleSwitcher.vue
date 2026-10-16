<script setup lang="ts">
// SR / EN toggle, remembered in a cookie (useLang).
const { locale, set, other } = useLang()
</script>

<template>
  <UTooltip :text="other === 'en' ? 'English' : 'Srpski'">
    <UButton
      variant="ghost"
      color="neutral"
      size="xs"
      :aria-label="other === 'en' ? 'English' : 'Srpski'"
      icon="i-lucide-languages"
      data-testid="locale-switch"
      @click="set(other)"
      >{{ locale === 'sr' ? 'EN' : 'SR' }}</UButton
    >
  </UTooltip>
</template>
