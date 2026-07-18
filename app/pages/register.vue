<script setup lang="ts">
definePageMeta({ public: true, layout: false })

const auth = useAuthStore()
const { t } = useI18n()

const step = ref(1)
const STEPS = 2

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const companyName = ref('')
const loading = ref(false)
const error = ref('')
const confirmSent = ref(false)
const resending = ref(false)
const resent = ref(false)

const PASSWORD_MIN = 12 // NIST SP 800-63B

const panelProps = computed(() =>
  step.value === 1
    ? {
        eyebrow: t('register.panelStep1Eyebrow'),
        heading: t('register.panelStep1Heading'),
        body: t('register.panelStep1Body'),
        icon: 'i-lucide-user',
      }
    : {
        eyebrow: t('register.panelStep2Eyebrow'),
        heading: t('register.panelStep2Heading'),
        body: t('register.panelStep2Body'),
        icon: 'i-lucide-building-2',
      },
)

function goNext() {
  error.value = ''
  if (!fullName.value.trim()) {
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
  step.value = 2
}

function goBack() {
  step.value = 1
  error.value = ''
}

async function submit() {
  error.value = ''
  const company = companyName.value.trim()
  if (!company) {
    error.value = t('register.error')
    return
  }
  loading.value = true
  try {
    const loggedIn = await auth.register(
      fullName.value.trim(),
      company,
      email.value.trim(),
      password.value,
    )
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
  <AuthShell v-bind="panelProps" :step="step" :steps="STEPS">
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

      <!-- Step 1: personal account -->
      <form v-if="step === 1" class="mt-6 flex flex-col gap-4" @submit.prevent="goNext">
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
        <UButton type="submit" block size="lg">{{ $t('register.next') }}</UButton>
      </form>

      <!-- Step 2: organisation -->
      <form v-else class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
        <UFormField :label="$t('register.companyName')">
          <UInput v-model="companyName" autocomplete="organization" class="w-full" required />
        </UFormField>
        <UAlert v-if="error" color="error" :title="error" />
        <div class="flex gap-3">
          <UButton variant="subtle" size="lg" @click="goBack">{{ $t('register.back') }}</UButton>
          <UButton type="submit" block size="lg" :loading="loading">
            {{ $t('register.submit') }}
          </UButton>
        </div>
      </form>

      <div class="mt-6 text-center text-sm text-muted">
        {{ $t('register.haveAccount') }}
        <ULink to="/login" class="font-medium text-primary">{{ $t('register.loginLink') }}</ULink>
      </div>
    </template>
  </AuthShell>
</template>
