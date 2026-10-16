<script setup lang="ts">
import { ACCENTS, CONTRASTS, FONTS, MOTIONS, TEXT_SIZES, type UiPrefs } from '~/utils/uiPrefs'

// Appearance and session preferences: saved on the profile, so they follow you to every device.
const { t } = useI18n()
const lang = useLang()
const accent = useAccent()
const font = useFont()
const display = useDisplay()
const { prefs, patch } = useUiPrefs()
const toast = useToast()

async function set<K extends keyof UiPrefs>(key: K, value: UiPrefs[K]) {
  try {
    if (key === 'locale' && value) await lang.set(value as 'sr' | 'en')
    if (key === 'accent' && value) accent.set(value as UiPrefs['accent'] & string)
    if (key === 'font' && value) font.set(value as UiPrefs['font'] & string)
    if (key === 'textSize') display.textSize.set(value as UiPrefs['textSize'])
    if (key === 'motion') display.motion.set(value as UiPrefs['motion'])
    if (key === 'contrast') display.contrast.set(value as UiPrefs['contrast'])
    await patch({ [key]: value } as Partial<UiPrefs>)
    toast.add({ title: t('prefs.saved'), color: 'success', duration: 1500 })
  } catch (e) {
    toast.add({ title: (e as Error).message, color: 'error' })
  }
}
const opts = <T extends string | number>(key: string, values: readonly T[]) =>
  values.map((v) => ({ label: t(`prefs.${key}.${v}`), value: v }))
</script>

<template>
  <UCard data-testid="prefs-section">
    <template #header>
      <h2 class="font-semibold">{{ t('prefs.title') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('prefs.help') }}</p>
    </template>
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField :label="t('prefs.language')">
        <USelect
          :model-value="prefs.locale ?? lang.locale.value"
          :items="[
            { label: 'English', value: 'en' },
            { label: 'Srpski', value: 'sr' },
          ]"
          class="w-full"
          data-testid="pref-locale"
          @update:model-value="(v) => set('locale', v as 'sr' | 'en')"
        />
      </UFormField>
      <UFormField :label="t('prefs.themeLabel')">
        <USelect
          :model-value="prefs.theme"
          :items="opts('theme', ['system', 'light', 'dark'] as const)"
          class="w-full"
          data-testid="pref-theme"
          @update:model-value="(v) => set('theme', v as UiPrefs['theme'])"
        />
      </UFormField>
      <UFormField :label="t('prefs.accentLabel')" class="sm:col-span-2">
        <div
          class="flex flex-wrap gap-2"
          role="radiogroup"
          :aria-label="t('prefs.accentLabel')"
          data-testid="pref-accent"
        >
          <UTooltip v-for="a in ACCENTS" :key="a" :text="t(`prefs.accent.${a}`)">
            <button
              type="button"
              role="radio"
              :aria-checked="accent.accent.value === a"
              :aria-label="t(`prefs.accent.${a}`)"
              :data-accent="a"
              class="flex size-8 items-center justify-center rounded-full bg-brand-700 ring-offset-2 ring-offset-(--ui-bg) focus-visible:ring-2 focus-visible:ring-(--ui-border-inverted)"
              :class="accent.accent.value === a ? 'ring-2 ring-(--ui-border-inverted)' : ''"
              @click="set('accent', a)"
            >
              <UIcon
                v-if="accent.accent.value === a"
                name="i-lucide-check"
                class="size-4 text-white"
              />
            </button>
          </UTooltip>
        </div>
      </UFormField>
      <!-- each sample sets its own data-font, so it is drawn in the typeface it offers -->
      <UFormField :label="t('prefs.fontLabel')" class="sm:col-span-2">
        <div
          class="grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="radiogroup"
          :aria-label="t('prefs.fontLabel')"
          data-testid="pref-font"
        >
          <button
            v-for="f in FONTS"
            :key="f"
            type="button"
            role="radio"
            :aria-checked="font.font.value === f"
            :data-font="f"
            class="rounded-(--ui-radius) border px-3 py-2 text-left transition-colors hover:bg-elevated focus-visible:ring-2 focus-visible:ring-primary"
            :class="font.font.value === f ? 'border-primary ring-1 ring-primary' : 'border-default'"
            @click="set('font', f)"
          >
            <span class="flex items-baseline justify-between gap-2">
              <span class="font-heading text-lg font-semibold text-highlighted">Aa Čć Đđ</span>
              <UIcon
                v-if="font.font.value === f"
                name="i-lucide-check"
                class="size-4 text-primary"
              />
            </span>
            <span class="mt-1 block text-sm text-highlighted">{{ t(`prefs.font.${f}`) }}</span>
            <span class="block text-xs text-muted tabular-nums">0123456789</span>
          </button>
        </div>
      </UFormField>
      <UFormField :label="t('prefs.textSizeLabel')">
        <USelect
          :model-value="prefs.textSize"
          :items="opts('textSize', TEXT_SIZES)"
          class="w-full"
          data-testid="pref-text-size"
          @update:model-value="(v) => set('textSize', Number(v) as UiPrefs['textSize'])"
        />
      </UFormField>
      <UFormField :label="t('prefs.contrastLabel')">
        <USelect
          :model-value="prefs.contrast"
          :items="opts('contrast', CONTRASTS)"
          class="w-full"
          data-testid="pref-contrast"
          @update:model-value="(v) => set('contrast', v as UiPrefs['contrast'])"
        />
      </UFormField>
      <UFormField :label="t('prefs.motionLabel')">
        <USelect
          :model-value="prefs.motion"
          :items="opts('motion', MOTIONS)"
          class="w-full"
          data-testid="pref-motion"
          @update:model-value="(v) => set('motion', v as UiPrefs['motion'])"
        />
      </UFormField>
      <UFormField
        :label="t('prefs.staySignedIn')"
        :help="t('prefs.staySignedInHelp')"
        class="sm:col-span-2"
      >
        <USwitch
          :model-value="prefs.staySignedIn"
          data-testid="pref-stay"
          @update:model-value="(v) => set('staySignedIn', v)"
        />
      </UFormField>
    </div>
  </UCard>
</template>
