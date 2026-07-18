<script setup lang="ts">
// ponytail: landing URL hardcoded - it's a fixed deploy target, not config.
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
  { icon: 'i-lucide-send' },
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
    <!-- Brand panel (desktop only) -->
    <aside
      class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-primary-600 to-primary-800 p-12 text-white lg:flex"
    >
      <!-- Decorative drifting orbs (CSS-only, pauses for reduced-motion) -->
      <div aria-hidden="true" class="auth-orbs pointer-events-none absolute inset-0">
        <span class="auth-orb auth-orb-1" />
        <span class="auth-orb auth-orb-2" />
        <span class="auth-orb auth-orb-3" />
      </div>

      <ULink
        :to="SITE_URL"
        external
        class="relative flex items-center gap-2 font-heading text-2xl font-extrabold tracking-tight text-white/90 hover:text-white"
      >
        <span class="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white/20">
          <UIcon name="i-lucide-send" class="size-[18px] text-white" />
        </span>
        Starter
      </ULink>

      <Transition name="auth-panel" mode="out-in">
        <div :key="step ?? 'static'" class="relative flex flex-col">
          <span
            class="auth-glyph mb-8 flex size-20 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm"
          >
            <UIcon :name="iconName" class="size-9 text-white" />
          </span>
          <p class="text-xs font-bold tracking-widest text-white/70 uppercase">
            {{ eyebrowText }}
          </p>
          <h1 class="mt-2 text-4xl font-bold tracking-tight">
            {{ headingText }}
          </h1>
          <p class="mt-4 max-w-md text-white/80">
            {{ bodyText }}
          </p>
          <div v-if="showDots" class="mt-10 flex gap-2" aria-hidden="true">
            <span
              v-for="i in steps"
              :key="i"
              class="h-2 rounded-full transition-all duration-300"
              :class="i === step ? 'w-8 bg-white' : 'w-2 bg-white/30'"
            />
          </div>
        </div>
      </Transition>

      <ULink
        :to="SITE_URL"
        external
        class="relative flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
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
      <!-- Mobile-only back-to-site link (panel is hidden) -->
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
.auth-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.5;
  will-change: transform;
}
.auth-orb-1 {
  width: 24rem;
  height: 24rem;
  top: -6rem;
  left: -4rem;
  background: rgb(255 255 255 / 0.35);
  animation: auth-drift-1 18s ease-in-out infinite;
}
.auth-orb-2 {
  width: 20rem;
  height: 20rem;
  bottom: -5rem;
  right: -3rem;
  background: rgb(255 255 255 / 0.25);
  animation: auth-drift-2 22s ease-in-out infinite;
}
.auth-orb-3 {
  width: 16rem;
  height: 16rem;
  top: 40%;
  left: 30%;
  background: rgb(0 0 0 / 0.15);
  animation: auth-drift-1 26s ease-in-out infinite reverse;
}

@keyframes auth-drift-1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(3rem, 2rem) scale(1.08);
  }
  66% {
    transform: translate(-2rem, 1rem) scale(0.95);
  }
}

@keyframes auth-drift-2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(-3rem, -2rem) scale(1.05);
  }
  75% {
    transform: translate(2rem, 1.5rem) scale(0.97);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-orb {
    animation: none;
  }
  .auth-panel-enter-active,
  .auth-panel-leave-active {
    transition: none !important;
  }
}

.auth-panel-enter-active,
.auth-panel-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.auth-panel-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}
.auth-panel-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
