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
const showDots = computed(() => props.step != null && props.steps != null)
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Brand panel (desktop only): deep indigo with a dot-grid overlay -->
    <aside
      class="dot-grid relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 p-12 text-white lg:flex"
    >
      <ULink
        :to="SITE_URL"
        external
        class="relative z-10 flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-white/90 hover:text-white"
      >
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <UIcon name="i-lucide-layers" class="size-[18px] text-white" />
        </span>
        Starter
      </ULink>

      <Transition name="auth-fade" mode="out-in">
        <div :key="step ?? 'static'" class="relative z-10 flex flex-col">
          <span
            class="mb-8 flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm"
          >
            <UIcon :name="iconName" class="size-8 text-white" />
          </span>
          <p class="text-xs font-bold tracking-[0.2em] text-white/60 uppercase">
            {{ eyebrowText }}
          </p>
          <h1 class="mt-3 font-heading text-4xl font-bold tracking-tight">
            {{ headingText }}
          </h1>
          <p class="mt-4 max-w-md text-white/75">
            {{ bodyText }}
          </p>
          <div v-if="showDots" class="mt-10 flex gap-2" aria-hidden="true">
            <span
              v-for="i in steps"
              :key="i"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="i === step ? 'w-8 bg-white' : 'w-1.5 bg-white/30'"
            />
          </div>
        </div>
      </Transition>

      <ULink
        :to="SITE_URL"
        external
        class="relative z-10 flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        {{ $t('auth.backToSite') }}
      </ULink>
    </aside>

    <!-- Form side -->
    <div class="relative flex flex-1 items-center justify-center p-6">
      <div class="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <ULink
        :to="SITE_URL"
        external
        class="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-muted hover:text-default lg:hidden"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        {{ $t('auth.backToSite') }}
      </ULink>

      <div class="w-full max-w-sm">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Subtle dot grid over the brand panel. */
.dot-grid::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: radial-gradient(ellipse at 30% 30%, black, transparent 75%);
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
