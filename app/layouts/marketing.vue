<script setup lang="ts">
const auth = useAuthStore()
const { t, locale, setLocale } = useI18n()
const { version } = useRuntimeConfig().public

const colorMode = useColorMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const year = new Date().getFullYear()

const productLinks = [
  { label: () => t('nav.features'), to: '/#features' },
  { label: () => t('nav.pricing'), to: '/pricing' },
  { label: () => t('footer.changelog'), to: '/changelog' },
]
const legalLinks = [
  { label: () => t('footer.terms'), to: '/terms' },
  { label: () => t('footer.privacy'), to: '/privacy' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-40 border-b border-default bg-default/80 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <NuxtLink to="/" :aria-label="t('nav.brand')">
          <AppLogo />
        </NuxtLink>

        <nav class="hidden items-center gap-6 md:flex">
          <NuxtLink
            to="/#features"
            class="text-sm font-medium text-muted hover:text-default"
          >
            {{ $t('nav.features') }}
          </NuxtLink>
          <NuxtLink to="/pricing" class="text-sm font-medium text-muted hover:text-default">
            {{ $t('nav.pricing') }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            size="xs"
            variant="ghost"
            color="neutral"
            :aria-label="t('theme.label')"
            @click="toggleColorMode"
          />
          <UButton
            icon="i-lucide-languages"
            size="xs"
            variant="ghost"
            color="neutral"
            :aria-label="t('theme.label')"
            @click="setLocale(locale === 'sr' ? 'en' : 'sr')"
          />
          <template v-if="auth.isAuthenticated">
            <UButton to="/dashboard" size="sm" trailing-icon="i-lucide-arrow-right">
              {{ $t('nav.dashboard') }}
            </UButton>
          </template>
          <template v-else>
            <UButton to="/login" size="sm" variant="ghost" color="neutral" class="hidden sm:inline-flex">
              {{ $t('nav.signIn') }}
            </UButton>
            <UButton to="/register" size="sm">{{ $t('nav.getStarted') }}</UButton>
          </template>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-default">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:justify-between"
      >
        <div class="max-w-xs">
          <AppLogo />
          <p class="mt-3 text-sm text-muted">{{ $t('footer.tagline') }}</p>
        </div>
        <div class="flex gap-16">
          <div>
            <p class="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
              {{ $t('footer.product') }}
            </p>
            <ul class="flex flex-col gap-2">
              <li v-for="l in productLinks" :key="l.to">
                <NuxtLink :to="l.to" class="text-sm text-muted hover:text-default">
                  {{ l.label() }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
              {{ $t('footer.legal') }}
            </p>
            <ul class="flex flex-col gap-2">
              <li v-for="l in legalLinks" :key="l.to">
                <NuxtLink :to="l.to" class="text-sm text-muted hover:text-default">
                  {{ l.label() }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="border-t border-default">
        <div
          class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted sm:px-6"
        >
          <span>© {{ year }} Starter. {{ $t('footer.rights') }}</span>
          <div class="flex items-center gap-3">
            <span>v{{ version }}</span>
            <!-- Point this at your repository. -->
            <ULink
              to="https://github.com"
              external
              target="_blank"
              aria-label="GitHub"
              class="text-muted hover:text-default"
            >
              <UIcon name="i-simple-icons-github" class="size-4" />
            </ULink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
