<script setup lang="ts">
import { parseDate } from '@internationalized/date'

// One date field everywhere: type it the way you write it (14.10.2026., 14.10., 2026-10-14,
// 14102026) or pick it from the calendar. Shows dd.MM.yyyy. in every browser (the placeholder follows the language); the model stays ISO.
defineOptions({ inheritAttrs: false })
const model = defineModel<string | null | undefined>()
const props = defineProps<{ disabled?: boolean }>()
const { t } = useI18n()

const text = ref(model.value ? formatDate(model.value) : '')
const invalid = ref(false)
const focused = ref(false)
watch(model, (v) => {
  if (!focused.value) text.value = v ? formatDate(v) : ''
})

// complete dates update the model while typing (so a click on Save right after typing sees them)
function onInput(v: string) {
  text.value = v
  const iso = parseDateInput(v)
  invalid.value = !!v.trim() && !iso
  if (iso) model.value = iso
  else if (!v.trim()) model.value = typeof model.value === 'string' ? '' : null
}
function onBlur() {
  focused.value = false
  if (!invalid.value) text.value = model.value ? formatDate(model.value) : ''
}
const calendar = computed({
  get: () => (model.value ? parseDate(model.value) : undefined),
  set: (v) => {
    model.value = v ? v.toString() : null
    text.value = model.value ? formatDate(model.value) : ''
    invalid.value = false
  },
})
</script>

<template>
  <UInput
    :model-value="text"
    :disabled="props.disabled"
    :placeholder="t('date.placeholder')"
    inputmode="numeric"
    autocomplete="off"
    class="w-40"
    :color="invalid ? 'error' : undefined"
    :highlight="invalid"
    :aria-invalid="invalid || undefined"
    v-bind="$attrs"
    @update:model-value="(v) => onInput(String(v ?? ''))"
    @focus="focused = true"
    @blur="onBlur"
  >
    <template v-if="!props.disabled" #trailing>
      <UPopover>
        <UTooltip :text="t('date.pick')"
          ><UButton
            color="neutral"
            variant="link"
            size="sm"
            class="border-0"
            icon="i-lucide-calendar"
            :aria-label="t('date.pick')"
        /></UTooltip>
        <template #content>
          <UCalendar v-model="calendar" :week-starts-on="1" />
        </template>
      </UPopover>
    </template>
  </UInput>
</template>
