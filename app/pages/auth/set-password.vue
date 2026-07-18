<script setup lang="ts">
definePageMeta({ public: true, layout: false })

const supabase = useSupabaseClient()
const { t } = useI18n()

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')

// This page adopts a session from a recovery or invite link before the user
// can set a password. Two arrival shapes:
//  - Recovery: the email links to ?token_hash=…&type=recovery and we exchange
//    it with verifyOtp. This works in ANY browser (no PKCE verifier needed),
//    unlike the module's automatic ?code= exchange, which only succeeds in the
//    browser that requested the reset - the "link expired" bug Marina hit.
//    (Invite can't use this path: its {{ .TokenHash }} is the raw confirmation
//    token, not the SHA-256 OTP hash verifyOtp expects, so it always "expires".)
//  - Invite: issued server-side via .ConfirmationURL→/verify, so GoTrue
//    redirects with implicit-style #access_token hash tokens the pkce client
//    ignores - adopt them explicitly with setSession.
onMounted(async () => {
  const query = new URLSearchParams(window.location.search)
  const token_hash = query.get('token_hash')
  if (token_hash) {
    const { error: e } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })
    if (e)
      error.value = e.message // surface the real cause instead of a generic "expired" on submit
    else window.history.replaceState(null, '', window.location.pathname)
    return
  }

  const params = new URLSearchParams(window.location.hash.slice(1))
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  if (access_token && refresh_token) {
    const { error: e } = await supabase.auth.setSession({ access_token, refresh_token })
    if (!e) window.history.replaceState(null, '', window.location.pathname)
  }
})

async function submit() {
  error.value = ''
  if (password.value.length < 8) {
    error.value = t('setPassword.tooShort')
    return
  }
  if (password.value !== confirm.value) {
    error.value = t('setPassword.mismatch')
    return
  }
  loading.value = true
  try {
    const { error: e } = await supabase.auth.updateUser({ password: password.value })
    if (e) throw e
    await navigateTo('/dashboard')
  } catch {
    // Most common cause: expired/invalid link → no session to update.
    error.value = t('setPassword.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell
    :heading="$t('setPassword.panelHeading')"
    :body="$t('setPassword.panelBody')"
    icon="i-lucide-key-round"
  >
    <AppLogo :class="'mb-4'" />
    <h2 class="text-lg font-bold">{{ $t('setPassword.title') }}</h2>
    <p class="text-sm text-muted">{{ $t('setPassword.subtitle') }}</p>

    <form class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
      <UFormField :label="$t('setPassword.password')">
        <UInput
          v-model="password"
          type="password"
          autocomplete="new-password"
          class="w-full"
          required
        />
      </UFormField>
      <UFormField :label="$t('setPassword.confirm')">
        <UInput
          v-model="confirm"
          type="password"
          autocomplete="new-password"
          class="w-full"
          required
        />
      </UFormField>
      <UAlert v-if="error" color="error" :title="error" />
      <UButton type="submit" block size="lg" :loading="loading">
        {{ $t('setPassword.submit') }}
      </UButton>
    </form>
  </AuthShell>
</template>
