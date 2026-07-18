<script setup lang="ts">
definePageMeta({ public: true, layout: false })

const auth = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

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
</script>

<template>
  <AuthShell
    :heading="$t('login.panelHeading')"
    :body="$t('login.panelBody')"
    icon="i-lucide-log-in"
  >
    <AppLogo class="mb-4" />
    <h2 class="text-lg font-bold">{{ $t('login.title') }}</h2>
    <p class="text-sm text-muted">{{ $t('login.subtitle') }}</p>

    <form class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
      <UFormField :label="$t('login.email')">
        <UInput v-model="email" type="email" autocomplete="email" class="w-full" required />
      </UFormField>
      <UFormField :label="$t('login.password')">
        <UInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          class="w-full"
          required
        />
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
  </AuthShell>
</template>
