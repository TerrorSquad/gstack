<script setup lang="ts">
// Generic landing/back link target — set to your marketing site.
const SITE_URL = 'https://example.com'

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    heading?: string
    body?: string
    icon?: string
    step?: number
    steps?: number
  }>(),
  { icon: 'i-lucide-layers' },
)

const { t } = useI18n()

const eyebrowText = computed(() => props.eyebrow ?? t('auth.eyebrow'))
const headingText = computed(() => props.heading ?? t('auth.tagline'))
const bodyText = computed(() => props.body ?? t('auth.subtitle'))
const iconName = computed(() => props.icon)
const showSteps = computed(() => props.step != null && props.steps != null)

// Two-digit step labels ("01"), so the rail keeps its rhythm past nine.
const pad = (n: number) => String(n).padStart(2, '0')

// Static selling points, set below the card as one quiet line.
const features = computed(() => [
  t('auth.featureAuth'),
  t('auth.featureBatteries'),
  t('auth.featureShip'),
])
</script>

<template>
  <!-- Single centered column rather than a brand/form split: the split hid its
       entire left half below `lg`, so most visitors never saw the half doing the
       selling. One layout, same at every width. -->
  <div class="auth-canvas relative flex min-h-screen flex-col">
    <header class="relative z-10 flex items-center justify-between px-6 py-5">
      <ULink
        :to="SITE_URL"
        external
        class="flex items-center gap-2 font-heading text-lg font-bold tracking-tight text-default"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-inverted"
        >
          <UIcon name="i-lucide-layers" class="size-[18px]" />
        </span>
        GStack
      </ULink>
      <ThemeSwitcher />
    </header>

    <main class="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
      <div class="w-full max-w-sm">
        <Transition name="auth-fade" mode="out-in">
          <div :key="step ?? 'static'">
            <!-- Numbered rail, not dots: registration is a real sequence, so the
                 number tells you where you are and how far is left. Anonymous
                 pills only told you there was more. -->
            <!-- Decorative: the eyebrow already says "Step 1 of 2" in words, so
                 announcing the rail too would read the same fact twice. -->
            <ol
              v-if="showSteps"
              class="mb-6 flex items-center gap-2 font-mono text-xs tabular-nums"
              aria-hidden="true"
            >
              <li v-for="i in steps" :key="i" class="flex items-center gap-2">
                <span :class="i === step ? 'font-semibold text-primary' : 'text-dimmed'">
                  {{ pad(i) }}
                </span>
                <span
                  v-if="i < (steps ?? 0)"
                  class="h-px w-6"
                  :class="i < (step ?? 0) ? 'bg-primary' : 'bg-accented'"
                  aria-hidden="true"
                />
              </li>
            </ol>

            <span
              class="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
            >
              <UIcon :name="iconName" class="size-5" />
            </span>

            <p class="text-xs font-semibold tracking-[0.18em] text-dimmed uppercase">
              {{ eyebrowText }}
            </p>
            <h1 class="mt-2 font-heading text-3xl font-bold tracking-tight text-highlighted">
              {{ headingText }}
            </h1>
            <p class="mt-2 text-sm text-muted">{{ bodyText }}</p>
          </div>
        </Transition>

        <div class="mt-7 rounded-2xl border border-default bg-elevated/60 p-6 backdrop-blur-sm">
          <slot />
        </div>

        <p class="mt-6 text-center text-xs leading-relaxed text-dimmed">
          <template v-for="(feature, i) in features" :key="feature">
            <span v-if="i > 0" aria-hidden="true"> · </span>{{ feature }}
          </template>
        </p>

        <div class="mt-6 text-center">
          <ULink
            :to="SITE_URL"
            external
            class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-default"
          >
            <UIcon name="i-lucide-arrow-left" class="size-4" />
            {{ $t('auth.backToSite') }}
          </ULink>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Dot grid with a brand-tinted glow behind the card. Both layers are masked to
   fade outward so the page reads as lit from the centre rather than papered. */
.auth-canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  /* --ui-border is defined in the ui layer's main.css, so the dots track the
     theme in both modes without a hardcoded rgba. */
  background-image: radial-gradient(var(--ui-border) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 80%);
}

.auth-canvas::after {
  content: '';
  position: absolute;
  inset: 0;
  /* color-mix, not `var(--x) / 12%` — the alpha shorthand only works on a raw
     color value, not on a custom property holding one. */
  background: radial-gradient(
    ellipse 40% 34% at 50% 38%,
    color-mix(in oklch, var(--ui-color-primary-600) 14%, transparent),
    transparent 70%
  );
}

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.auth-fade-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}
.auth-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

@media (prefers-reduced-motion: reduce) {
  .auth-fade-enter-active,
  .auth-fade-leave-active {
    transition: none;
  }
}
</style>
