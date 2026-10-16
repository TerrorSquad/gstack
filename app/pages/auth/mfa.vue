<script setup lang="ts">
// Second step of a two-factor login: the 6-digit code from the authenticator app.
definePageMeta({ layout: false })
const { t } = useI18n()
const supabase = useSupabaseClient()
const code = ref('')
const error = ref('')
const loading = ref(false)
const recovery = ref(false)
// the 6th digit submits — no extra click after typing the code
watch(code, (v) => {
  if (v.trim().length === 6 && !loading.value) void verify()
})
const recoveryCode = ref('')

// Lost phone: a recovery code removes the authenticator; the user then sets up a new one on the account page.
async function recover() {
  loading.value = true
  error.value = ''
  const { data, error: e } = await supabase.rpc('use_recovery_code', { p_code: recoveryCode.value })
  loading.value = false
  if (e || !data) {
    error.value = t('mfa.wrongRecovery')
    return
  }
  await supabase.auth.refreshSession()
  await navigateTo('/account?mfa=recovered')
}

async function verify() {
  if (loading.value) return // auto-submit and a click must not send the same code twice
  loading.value = true
  error.value = ''
  try {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totp = factors?.totp.find((f) => f.status === 'verified')
    if (!totp) return navigateTo('/dashboard')
    const { error: e } = await supabase.auth.mfa.challengeAndVerify({
      factorId: totp.id,
      code: code.value.trim(),
    })
    if (e) throw e
    await navigateTo('/dashboard')
  } catch {
    error.value = t('mfa.wrongCode')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell :heading="t('mfa.title')" :body="t('mfa.body')">
    <form v-if="recovery" class="flex flex-col gap-4" @submit.prevent="recover">
      <UFormField :label="t('mfa.recoveryCode')">
        <UInput
          v-model="recoveryCode"
          class="w-full"
          autocomplete="off"
          autofocus
          data-testid="mfa-recovery-code"
        />
      </UFormField>
      <UAlert v-if="error" color="error" :title="error" />
      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="!recoveryCode.trim()"
        data-testid="mfa-recover"
        >{{ t('mfa.recover') }}</UButton
      >
    </form>
    <form v-else class="flex flex-col gap-4" @submit.prevent="verify">
      <UFormField :label="t('mfa.code')">
        <UInput
          v-model="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          class="w-full"
          autofocus
          data-testid="mfa-code"
        />
      </UFormField>
      <UAlert v-if="error" color="error" :title="error" />
      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="code.trim().length !== 6"
        data-testid="mfa-verify"
        >{{ t('mfa.verify') }}</UButton
      >
      <UButton
        variant="link"
        size="sm"
        class="self-center"
        data-testid="mfa-use-recovery"
        @click="
          () => {
            recovery = true
            error = ''
          }
        "
        >{{ t('mfa.lostPhone') }}</UButton
      >
    </form>
  </AuthShell>
</template>
