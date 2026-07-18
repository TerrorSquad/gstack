<script setup lang="ts">
const auth = useAuthStore()
const supabase = useSupabaseClient()
const { t } = useI18n()
const toast = useToast()
const { confirm } = useConfirm()

useHead({ title: () => t('nav.account') })

// --- Profile ---
const fullName = ref(auth.profile?.fullName ?? '')
const savingProfile = ref(false)
async function saveProfile() {
  savingProfile.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.value.trim() })
      .eq('id', auth.profile!.id)
    if (error) throw error
    await auth.ensureProfile()
    toast.add({ title: t('account.saved'), color: 'success' })
  } catch {
    toast.add({ title: t('common.saveError'), color: 'error' })
  } finally {
    savingProfile.value = false
  }
}

// --- Avatar ---
const uploading = ref(false)
async function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const ext = file.name.split('.').pop() || 'png'
    const path = `${auth.profile!.id}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    // Cache-bust so the new image shows immediately.
    const url = `${data.publicUrl}?t=${Date.now()}`
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', auth.profile!.id)
    await auth.ensureProfile()
    toast.add({ title: t('account.avatarUpdated'), color: 'success' })
  } catch {
    toast.add({ title: t('account.avatarError'), color: 'error' })
  } finally {
    uploading.value = false
  }
}

// --- Security ---
const newEmail = ref('')
const savingEmail = ref(false)
async function updateEmail() {
  if (!newEmail.value.trim()) return
  savingEmail.value = true
  try {
    const { error } = await supabase.auth.updateUser({ email: newEmail.value.trim() })
    if (error) throw error
    toast.add({ title: t('account.emailUpdateSent'), color: 'success' })
    newEmail.value = ''
  } catch {
    toast.add({ title: t('common.saveError'), color: 'error' })
  } finally {
    savingEmail.value = false
  }
}

const password = ref('')
const confirmPassword = ref('')
const savingPassword = ref(false)
async function updatePassword() {
  if (password.value.length < 8) {
    toast.add({ title: t('account.passwordTooShort'), color: 'error' })
    return
  }
  if (password.value !== confirmPassword.value) {
    toast.add({ title: t('account.passwordMismatch'), color: 'error' })
    return
  }
  savingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    toast.add({ title: t('account.passwordUpdated'), color: 'success' })
    password.value = ''
    confirmPassword.value = ''
  } catch {
    toast.add({ title: t('common.saveError'), color: 'error' })
  } finally {
    savingPassword.value = false
  }
}

// --- Danger zone ---
const deleting = ref(false)
async function deleteAccount() {
  if (!(await confirm(t('account.deleteConfirm')))) return
  deleting.value = true
  try {
    await $fetch('/api/account/delete', { method: 'POST' })
    await auth.logout()
    window.location.assign('/')
  } catch {
    toast.add({ title: t('common.saveError'), color: 'error' })
    deleting.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-2xl space-y-6 py-8">
    <h1 class="text-2xl font-bold">{{ $t('account.title') }}</h1>

    <!-- Profile -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ $t('account.profileSection') }}</h2>
      </template>
      <div class="flex items-center gap-4">
        <UAvatar :src="auth.profile?.avatarUrl ?? undefined" :alt="auth.profile?.fullName" size="xl" />
        <div>
          <label
            class="surface-border inline-flex cursor-pointer items-center gap-2 rounded-(--ui-radius) px-3 py-1.5 text-sm font-medium hover:bg-muted/40"
          >
            <UIcon name="i-lucide-upload" class="size-4" />
            {{ uploading ? $t('common.loading') : $t('account.changeAvatar') }}
            <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
          </label>
        </div>
      </div>
      <form class="mt-6 flex flex-col gap-4" @submit.prevent="saveProfile">
        <UFormField :label="$t('account.fullName')">
          <UInput v-model="fullName" class="w-full" required />
        </UFormField>
        <UFormField :label="$t('account.role')">
          <UInput :model-value="t(`common.role.${auth.profile?.role}`)" disabled class="w-full" />
        </UFormField>
        <div>
          <UButton type="submit" :loading="savingProfile">{{ $t('common.save') }}</UButton>
        </div>
      </form>
    </UCard>

    <!-- Security -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ $t('account.security') }}</h2>
      </template>
      <form class="flex flex-col gap-4" @submit.prevent="updateEmail">
        <UFormField :label="$t('account.newEmail')" :help="auth.profile?.email ?? ''">
          <UInput v-model="newEmail" type="email" autocomplete="email" class="w-full" />
        </UFormField>
        <div>
          <UButton type="submit" variant="outline" color="neutral" :loading="savingEmail">
            {{ $t('account.updateEmail') }}
          </UButton>
        </div>
      </form>
      <form class="mt-6 flex flex-col gap-4 border-t border-default pt-6" @submit.prevent="updatePassword">
        <UFormField :label="$t('account.newPassword')">
          <UInput v-model="password" type="password" autocomplete="new-password" class="w-full" />
        </UFormField>
        <UFormField :label="$t('account.confirmPassword')">
          <UInput
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>
        <div>
          <UButton type="submit" variant="outline" color="neutral" :loading="savingPassword">
            {{ $t('account.updatePassword') }}
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Danger zone -->
    <UCard :ui="{ root: 'ring-1 ring-error/40' }">
      <template #header>
        <h2 class="font-semibold text-error">{{ $t('account.dangerZone') }}</h2>
      </template>
      <p class="text-sm text-muted">{{ $t('account.deleteWarning') }}</p>
      <UButton color="error" class="mt-4" :loading="deleting" @click="deleteAccount">
        {{ $t('account.deleteAccount') }}
      </UButton>
    </UCard>
  </UContainer>
</template>
