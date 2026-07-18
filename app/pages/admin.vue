<script setup lang="ts">
// Role gate: the global middleware bounces non-admins to /dashboard. RLS is the
// real security layer (see docs/adr); this meta is UX only.
definePageMeta({ roles: ['admin'] })

const { t } = useI18n()
useHead({ title: () => t('nav.admin') })

// Reads all profiles — allowed for any signed-in user by RLS, shown here only
// as an example admin surface.
const supabase = useSupabaseClient()
const { data: profiles } = await useAsyncData('admin-profiles', async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .order('created_at')
  if (error) throw error
  return data ?? []
})
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold">{{ $t('admin.title') }}</h1>
    <p class="mt-1 text-muted">{{ $t('admin.subtitle') }}</p>

    <div class="mt-8 flex flex-col gap-2">
      <div
        v-for="p in profiles"
        :key="p.id"
        class="surface-border flex items-center justify-between rounded-(--ui-radius) p-4"
      >
        <div>
          <p class="font-semibold">{{ p.full_name }}</p>
          <p class="text-sm text-muted">{{ p.email }}</p>
        </div>
        <UBadge :color="p.role === 'admin' ? 'primary' : 'neutral'">
          {{ $t(`common.role.${p.role}`) }}
        </UBadge>
      </div>
    </div>
  </UContainer>
</template>
