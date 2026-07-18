<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const auth = useAuthStore()
const role = computed(() => auth.role)
const { t, locale, setLocale } = useI18n()
const route = useRoute()
const { version, notificationsEnabled } = useRuntimeConfig().public

async function logout() {
  await auth.logout()
  // Full document load (not client-side nav) so all in-memory state is wiped
  // before the next user logs in on the same tab.
  window.location.assign('/login')
}

const links = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
    { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
    { label: t('nav.notes'), icon: 'i-lucide-notebook-pen', to: '/notes' },
  ]
  if (role.value === 'admin') {
    items.push({ label: t('nav.admin'), icon: 'i-lucide-shield', to: '/admin' })
  }
  return items
})

const colorMode = useColorMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const themeItem = computed<NavigationMenuItem[]>(() => [
  {
    label: colorMode.value === 'dark' ? t('theme.light') : t('theme.dark'),
    icon: colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon',
    onSelect: toggleColorMode,
  },
])

const localeItem = computed<NavigationMenuItem[]>(() => [
  {
    label: locale.value === 'sr' ? 'English' : 'Srpski',
    icon: 'i-lucide-languages',
    onSelect: () => setLocale(locale.value === 'sr' ? 'en' : 'sr'),
  },
])

const accountItem = computed<NavigationMenuItem[]>(() => [
  { label: t('nav.account'), icon: 'i-lucide-user-cog', to: '/account' },
])

const pageTitle = computed(() => {
  const match = links.value
    .filter((l) => typeof l.to === 'string' && route.path.startsWith(l.to))
    .toSorted((a, b) => (b.to as string).length - (a.to as string).length)[0]
  return match?.label ?? t('nav.brand')
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar collapsible :default-size="16" :min-size="16" :max-size="16">
      <template #header="{ collapsed }">
        <NuxtLink
          v-if="!collapsed"
          to="/dashboard"
          class="flex min-w-0 flex-1 items-center gap-2 font-bold"
        >
          <AppLogo class="text-base" />
        </NuxtLink>
        <UDashboardSidebarCollapse :class="collapsed ? 'mx-auto' : 'ms-auto'" />
      </template>

      <template #default>
        <UNavigationMenu :items="links" orientation="vertical" variant="pill" />
      </template>

      <template #footer="{ collapsed }">
        <footer class="flex w-full flex-col gap-3">
          <UNavigationMenu
            :items="accountItem"
            :collapsed="collapsed"
            orientation="vertical"
            variant="pill"
          />
          <UNavigationMenu
            :items="themeItem"
            :collapsed="collapsed"
            orientation="vertical"
            variant="pill"
          />
          <UNavigationMenu
            :items="localeItem"
            :collapsed="collapsed"
            orientation="vertical"
            variant="pill"
          />
          <div
            class="flex w-full items-center gap-2.5 border-t border-default pt-4"
            :class="collapsed ? 'justify-center' : 'justify-between'"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2.5">
              <UAvatar :alt="auth.profile?.fullName" size="sm" class="shrink-0" />
              <div v-if="!collapsed" class="flex min-w-0 flex-col text-left leading-none">
                <span class="truncate text-sm font-semibold">{{ auth.profile?.fullName }}</span>
                <ULink to="/changelog" class="mt-1 truncate text-[11px] text-muted hover:text-default">
                  v{{ version }}
                </ULink>
              </div>
            </div>
            <UTooltip v-if="!collapsed" :text="t('nav.logout')">
              <UButton
                variant="ghost"
                color="error"
                icon="i-lucide-log-out"
                :aria-label="t('nav.logout')"
                @click="logout"
              />
            </UTooltip>
          </div>
        </footer>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="pageTitle">
          <template #right>
            <NotificationBell v-if="notificationsEnabled" />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <main>
          <slot />
        </main>
        <ConfirmModal />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
