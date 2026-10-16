<script setup lang="ts">
defineOptions({ inheritAttrs: false })
// A password field with a reveal toggle and a Caps Lock hint.
// Attributes (autocomplete, required, data-testid…) pass through to the input.
const model = defineModel<string>({ required: true })
const { t } = useI18n()
const visible = ref(false)
const capsLock = ref(false)
const onKey = (e: KeyboardEvent) => (capsLock.value = e.getModifierState?.('CapsLock') ?? false)
</script>

<template>
  <div class="w-full">
    <UInput
      v-model="model"
      :type="visible ? 'text' : 'password'"
      class="w-full"
      v-bind="$attrs"
      @keydown="onKey"
      @keyup="onKey"
    >
      <template #trailing>
        <!-- stays in the tab order: keyboard-only users must be able to reveal too -->
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          type="button"
          :icon="visible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="visible ? t('auth.hidePassword') : t('auth.showPassword')"
          :aria-pressed="visible"
          class="border-0"
          data-testid="password-reveal"
          @click="visible = !visible"
        />
      </template>
    </UInput>
    <p v-if="capsLock" class="mt-1 text-xs text-warning" role="status">{{ t('auth.capsLock') }}</p>
  </div>
</template>
