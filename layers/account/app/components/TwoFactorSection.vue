<script setup lang="ts">
// Two-factor login with an authenticator app (TOTP): enable by scanning a QR code and confirming one code; disable.
const { t } = useI18n()
const toast = useToast()
const supabase = useSupabaseClient()
const factorId = ref<string | null>(null) // verified factor
const pending = ref<{ id: string; qr: string; secret: string } | null>(null)
const code = ref('')
const busy = ref(false)
const error = ref('')
const codesLeft = ref(0)
const freshCodes = ref<string[]>([])

async function load() {
  const { data } = await supabase.auth.mfa.listFactors()
  factorId.value = data?.totp.find((f) => f.status === 'verified')?.id ?? null
  if (factorId.value) codesLeft.value = (await supabase.rpc('recovery_codes_left')).data ?? 0
}
// Ten one-time codes for when the phone is lost; shown once, only their hashes are stored.
async function newCodes() {
  const { data, error: e } = await supabase.rpc('generate_recovery_codes')
  if (e) {
    error.value = e.message
    return
  }
  freshCodes.value = data
  codesLeft.value = data.length
}
onMounted(load)

async function start() {
  error.value = ''
  // a half-finished enrolment from before blocks a new one: clear it
  const { data: all } = await supabase.auth.mfa.listFactors()
  for (const f of all?.all ?? [])
    if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id })
  const { data, error: e } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `GStack ${todayIso()}`,
  })
  if (e || !data) {
    error.value = e?.message ?? ''
    return
  }
  pending.value = { id: data.id, qr: data.totp.qr_code, secret: data.totp.secret }
}
async function confirm() {
  if (!pending.value) return
  busy.value = true
  error.value = ''
  const { error: e } = await supabase.auth.mfa.challengeAndVerify({
    factorId: pending.value.id,
    code: code.value.trim(),
  })
  busy.value = false
  if (e) {
    error.value = t('mfa.wrongCode')
    return
  }
  pending.value = null
  code.value = ''
  await load()
  toast.add({ title: t('mfa.enabled'), color: 'success' })
}
async function disable() {
  if (!factorId.value) return
  const { error: e } = await supabase.auth.mfa.unenroll({ factorId: factorId.value })
  if (e) {
    error.value = e.message
    return
  }
  await load()
  toast.add({ title: t('mfa.disabled'), color: 'success' })
}
</script>

<template>
  <UCard data-testid="mfa-section">
    <h2 class="mb-1 font-semibold">{{ t('mfa.sectionTitle') }}</h2>
    <p class="mb-3 text-sm text-muted">{{ t('mfa.sectionBody') }}</p>
    <div v-if="factorId" class="flex items-center gap-3">
      <UBadge color="success" variant="subtle" icon="i-lucide-shield-check" data-testid="mfa-on">{{
        t('mfa.on')
      }}</UBadge>
      <UButton
        variant="outline"
        color="error"
        size="sm"
        data-testid="mfa-disable"
        @click="disable"
        >{{ t('mfa.disable') }}</UButton
      >
    </div>
    <div v-if="factorId" class="mt-4 border-t border-default pt-3">
      <p class="text-sm">{{ t('mfa.recoveryLeft', { n: codesLeft }) }}</p>
      <UButton
        class="mt-2"
        size="sm"
        variant="outline"
        icon="i-lucide-key-round"
        data-testid="mfa-new-codes"
        @click="newCodes"
        >{{ t('mfa.recoveryNew') }}</UButton
      >
      <div v-if="freshCodes.length" class="mt-3">
        <p class="mb-2 text-sm text-warning">{{ t('mfa.recoverySave') }}</p>
        <ul class="grid grid-cols-2 gap-1 font-mono text-sm" data-testid="mfa-codes">
          <li v-for="c in freshCodes" :key="c">{{ c }}</li>
        </ul>
      </div>
    </div>
    <div v-else-if="pending" class="flex flex-col gap-3">
      <p class="text-sm">{{ t('mfa.scan') }}</p>
      <img :src="pending.qr" alt="" class="size-40 rounded bg-white p-2" />
      <p class="text-xs text-muted">
        {{ t('mfa.orSecret') }} <code data-testid="mfa-secret">{{ pending.secret }}</code>
      </p>
      <div class="flex items-end gap-2">
        <UFormField :label="t('mfa.code')"
          ><UInput v-model="code" inputmode="numeric" maxlength="6" data-testid="mfa-enroll-code"
        /></UFormField>
        <UButton
          :loading="busy"
          :disabled="code.trim().length !== 6"
          data-testid="mfa-confirm"
          @click="confirm"
          >{{ t('mfa.confirm') }}</UButton
        >
      </div>
    </div>
    <UButton
      v-else
      variant="outline"
      icon="i-lucide-shield-plus"
      data-testid="mfa-enable"
      @click="start"
      >{{ t('mfa.enable') }}</UButton
    >
    <UAlert v-if="error" class="mt-3" color="error" :title="error" />
  </UCard>
</template>
