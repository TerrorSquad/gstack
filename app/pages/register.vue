<script setup lang="ts">
definePageMeta({ public: true, layout: false })

const auth = useAuthStore()
const { t } = useI18n()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const confirmSent = ref(false)
const resending = ref(false)
const resent = ref(false)

const PASSWORD_MIN = 12 // NIST SP 800-63B

async function submit() {
  error.value = ''
  const name = fullName.value.trim()
  if (!name) {
    error.value = t('register.error')
    return
  }
  if (password.value.length < PASSWORD_MIN) {
    error.value = t('register.passwordTooShort', { min: PASSWORD_MIN })
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = t('register.passwordMismatch')
    return
  }
  loading.value = true
  try {
    const loggedIn = await auth.register(name, email.value.trim(), password.value)
    if (loggedIn) await navigateTo('/dashboard')
    else confirmSent.value = true
  } catch {
    error.value = t('register.error')
  } finally {
    loading.value = false
  }
}

async function resend() {
  resending.value = true
  resent.value = false
  error.value = ''
  try {
    await auth.resendConfirmation(email.value.trim())
    resent.value = true
  } catch {
    error.value = t('register.resendError')
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <AuthShell
    :heading="$t('register.panelHeading')"
    :body="$t('register.panelBody')"
    icon="i-lucide-user-plus"
  >
    <AppLogo class="mb-4" />

    <div v-if="confirmSent" class="flex flex-col gap-3">
      <UAlert
        color="success"
        icon="i-lucide-mail-check"
        :title="$t('register.confirmTitle')"
        :description="$t('register.confirmDescription')"
      />
      <UAlert v-if="error" color="error" :title="error" />
      <p v-if="resent" class="text-center text-sm text-success">{{ $t('register.resendDone') }}</p>
      <div class="text-center text-sm text-muted">
        {{ $t('register.resendPrompt') }}
        <UButton variant="link" class="p-0" :loading="resending" @click="resend">
          {{ $t('register.resend') }}
        </UButton>
      </div>
    </div>

    <template v-else>
      <h2 class="text-lg font-bold">{{ $t('register.title') }}</h2>
      <p class="text-sm text-muted">{{ $t('register.subtitle') }}</p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
        <UFormField :label="$t('register.fullName')">
          <UInput v-model="fullName" autocomplete="name" class="w-full" required />
        </UFormField>
        <UFormField :label="$t('register.email')">
          <UInput v-model="email" type="email" autocomplete="email" class="w-full" required />
        </UFormField>
        <UFormField :label="$t('register.password')">
          <UInput
            v-model="password"
            type="password"
            autocomplete="new-password"
            class="w-full"
            required
          />
        </UFormField>
        <UFormField :label="$t('register.confirmPassword')">
          <UInput
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="w-full"
            required
          />
        </UFormField>
        <UAlert v-if="error" color="error" :title="error" />
        <UButton type="submit" block size="lg" :loading="loading">
          {{ $t('register.submit') }}
        </UButton>
      </form>

      <div class="mt-6 text-center text-sm text-muted">
        {{ $t('register.haveAccount') }}
        <ULink to="/login" class="font-medium text-primary">{{ $t('register.loginLink') }}</ULink>
      </div>
    </template>
  </AuthShell>
</template>
