<script setup lang="ts">
definePageMeta({ public: true, layout: false })

const supabase = useSupabaseClient()
const { t } = useI18n()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const origin = window.location.origin
    const { error: e } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${origin}/auth/set-password`,
    })
    if (e) throw e
    // Always show success even if the email isn't registered - don't leak which
    // addresses have accounts.
    sent.value = true
  } catch {
    error.value = t('forgotPassword.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell
    :heading="$t('forgotPassword.title')"
    :body="$t('forgotPassword.subtitle')"
    icon="i-lucide-lock-keyhole"
  >
    <UAlert v-if="sent" color="success" :title="$t('forgotPassword.sent')" />
    <form v-else class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
      <UFormField :label="$t('login.email')">
        <UInput v-model="email" type="email" autocomplete="email" class="w-full" required />
      </UFormField>
      <UAlert v-if="error" color="error" :title="error" />
      <UButton type="submit" block size="lg" :loading="loading">
        {{ $t('forgotPassword.submit') }}
      </UButton>
    </form>

    <div class="mt-6 text-center text-sm text-muted">
      <ULink to="/login" class="font-medium text-primary">{{
        $t('forgotPassword.backToLogin')
      }}</ULink>
    </div>
  </AuthShell>
</template>
