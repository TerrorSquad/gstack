<script setup lang="ts">
const auth = useAuthStore()
const supabase = useSupabaseClient()
const { t } = useI18n()
const toast = useToast()

useHead({ title: () => t('nav.account') })

const fullName = ref(auth.profile?.fullName ?? '')
const loading = ref(false)

async function save() {
  loading.value = true
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
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-xl py-8">
    <h1 class="text-2xl font-bold">{{ $t('account.title') }}</h1>

    <form class="mt-6 flex flex-col gap-4" @submit.prevent="save">
      <UFormField :label="$t('account.fullName')">
        <UInput v-model="fullName" class="w-full" required />
      </UFormField>
      <UFormField :label="$t('account.email')">
        <UInput :model-value="auth.profile?.email" disabled class="w-full" />
      </UFormField>
      <UFormField :label="$t('account.role')">
        <UInput :model-value="t(`common.role.${auth.profile?.role}`)" disabled class="w-full" />
      </UFormField>
      <div>
        <UButton type="submit" :loading="loading">{{ $t('common.save') }}</UButton>
      </div>
    </form>
  </UContainer>
</template>
