<script setup lang="ts">
import { DEMO_ACCOUNTS, PASSWORD } from '~~/scripts/seed/fixtures'

definePageMeta({ public: true, layout: false })

const auth = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
// demo logins: only deployments whose seeded demo tenant is all there is to see turn the flag on
const demoAccounts = useRuntimeConfig().public.showDemoAccounts ? DEMO_ACCOUNTS : []
const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
function demo(acc: (typeof DEMO_ACCOUNTS)[number]) {
  email.value = acc.email
  password.value = PASSWORD
  void submit()
}
// signed out by the idle timer: say so, or it looks like a bug
const idle = useRoute().query.idle === '1'

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch {
    error.value = t('login.error')
  } finally {
    loading.value = false
  }
}

const oauthLoading = ref('')
async function oauth(provider: 'github' | 'google') {
  oauthLoading.value = provider
  error.value = ''
  try {
    await auth.loginWithOAuth(provider) // redirects away on success
  } catch {
    error.value = t('login.oauthError')
    oauthLoading.value = ''
  }
}
</script>

<template>
  <!-- Heading/brand live in AuthShell; repeating them in the slot stacked two
       logos and two headings once the layout became a single column. -->
  <AuthShell :heading="$t('login.title')" :body="$t('login.subtitle')" icon="i-lucide-log-in">
    <div class="flex flex-col gap-2">
      <UButton
        block
        size="lg"
        color="neutral"
        variant="outline"
        icon="i-simple-icons-github"
        :loading="oauthLoading === 'github'"
        :disabled="!!oauthLoading"
        @click="oauth('github')"
      >
        {{ $t('login.continueWithGithub') }}
      </UButton>
      <UButton
        block
        size="lg"
        color="neutral"
        variant="outline"
        icon="i-simple-icons-google"
        :loading="oauthLoading === 'google'"
        :disabled="!!oauthLoading"
        @click="oauth('google')"
      >
        {{ $t('login.continueWithGoogle') }}
      </UButton>
    </div>

    <div class="my-6 flex items-center gap-3 text-xs text-muted">
      <span class="h-px flex-1 bg-default" />
      {{ $t('login.orContinueWith') }}
      <span class="h-px flex-1 bg-default" />
    </div>

    <UAlert
      v-if="idle"
      class="mb-4"
      color="info"
      icon="i-lucide-timer"
      :title="$t('login.idleTitle')"
      :description="$t('login.idleBody')"
      data-testid="idle-notice"
    />
    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <UFormField :label="$t('login.email')">
        <UInput v-model="email" type="email" autocomplete="email" class="w-full" required />
      </UFormField>
      <UFormField :label="$t('login.password')">
        <PasswordInput v-model="password" autocomplete="current-password" required />
      </UFormField>
      <div class="text-right">
        <ULink to="/auth/forgot-password" class="text-sm font-medium text-primary">
          {{ $t('login.forgotPassword') }}
        </ULink>
      </div>
      <UAlert v-if="error" color="error" :title="error" />
      <UButton
        type="submit"
        block
        size="lg"
        trailing-icon="i-lucide-arrow-right"
        :loading="loading"
      >
        {{ $t('login.submit') }}
      </UButton>
    </form>

    <div class="mt-6 text-center text-sm text-muted">
      {{ $t('login.noAccount') }}
      <ULink to="/register" class="font-medium text-primary">{{ $t('login.registerLink') }}</ULink>
    </div>
    <section
      v-if="demoAccounts.length"
      class="mt-6 border-t border-dashed border-default pt-4"
      data-testid="demo-accounts"
    >
      <h2 class="mb-3 text-center text-xs font-medium text-muted">{{ $t('login.demoTitle') }}</h2>
      <ul class="flex flex-col gap-1.5">
        <li v-for="acc in demoAccounts" :key="acc.email">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-3 rounded-(--ui-radius) border border-default px-3 py-2 text-left transition-colors hover:bg-elevated disabled:cursor-wait disabled:opacity-60"
            :disabled="loading"
            @click="demo(acc)"
          >
            <span
              aria-hidden="true"
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
              >{{ initials(acc.fullName) }}</span
            >
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium text-highlighted">{{
                acc.fullName
              }}</span>
              <span class="block text-xs text-muted">{{ $t(`login.demoRole.${acc.role}`) }}</span>
            </span>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed" />
          </button>
        </li>
      </ul>
    </section>
  </AuthShell>
</template>
