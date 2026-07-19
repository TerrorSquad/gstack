<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

// Role gate is UX; RLS + the admin server routes are the real security.
definePageMeta({ roles: ['admin'] })

const { t } = useI18n()
const toast = useToast()
const { confirm } = useConfirm()
useHead({ title: () => t('nav.admin') })

interface AdminUser {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'member'
  banned: boolean
  isSelf: boolean
}

// useFetch (not useAsyncData + $fetch) so the auth cookie is forwarded to the
// internal API route during SSR — otherwise requireAdmin sees no session.
const { data: users, refresh, pending } = await useFetch<AdminUser[]>('/api/admin/users')

// --- Invite ---
const inviteEmail = ref('')
const inviting = ref(false)
async function invite() {
  if (!inviteEmail.value.trim()) return
  inviting.value = true
  try {
    await $fetch('/api/admin/invite', { method: 'POST', body: { email: inviteEmail.value.trim() } })
    toast.add({ title: t('admin.inviteSent'), color: 'success' })
    inviteEmail.value = ''
  } catch (e) {
    toast.add({ title: (e as { data?: { message?: string } })?.data?.message ?? t('admin.inviteError'), color: 'error' })
  } finally {
    inviting.value = false
  }
}

async function act(url: string, body: Record<string, unknown>, successMsg?: string) {
  try {
    const res = await $fetch<{ ok?: boolean; link?: string }>(url, { method: 'POST', body })
    if (res.link) window.open(res.link, '_blank', 'noopener')
    if (successMsg) toast.add({ title: successMsg, color: 'success' })
    await refresh()
  } catch (e) {
    toast.add({ title: (e as { data?: { message?: string } })?.data?.message ?? t('common.saveError'), color: 'error' })
  }
}

async function remove(u: AdminUser) {
  if (!(await confirm(t('admin.deleteConfirm', { name: u.full_name })))) return
  await act('/api/admin/delete-user', { userId: u.id }, t('account.saved'))
}

function actionsFor(u: AdminUser): DropdownMenuItem[] {
  if (u.isSelf) return []
  return [
    u.role === 'admin'
      ? { label: t('admin.makeMember'), icon: 'i-lucide-user', onSelect: () => act('/api/admin/set-role', { userId: u.id, role: 'member' }) }
      : { label: t('admin.makeAdmin'), icon: 'i-lucide-shield', onSelect: () => act('/api/admin/set-role', { userId: u.id, role: 'admin' }) },
    u.banned
      ? { label: t('admin.unban'), icon: 'i-lucide-circle-check', onSelect: () => act('/api/admin/ban', { userId: u.id, banned: false }) }
      : { label: t('admin.ban'), icon: 'i-lucide-ban', onSelect: () => act('/api/admin/ban', { userId: u.id, banned: true }) },
    { label: t('admin.impersonate'), icon: 'i-lucide-venetian-mask', onSelect: () => act('/api/admin/impersonate', { userId: u.id }) },
    { label: t('admin.delete'), icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => remove(u) },
  ]
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold">{{ $t('admin.title') }}</h1>
    <p class="mt-1 text-muted">{{ $t('admin.subtitle') }}</p>

    <!-- Invite -->
    <form class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="invite">
      <UFormField :label="$t('admin.inviteEmail')" class="flex-1">
        <UInput v-model="inviteEmail" type="email" class="w-full" :placeholder="'name@example.com'" />
      </UFormField>
      <UButton type="submit" icon="i-lucide-mail-plus" :loading="inviting">
        {{ $t('admin.invite') }}
      </UButton>
    </form>

    <!-- Members -->
    <div class="mt-8 flex flex-col gap-2">
      <div
        v-for="i in pending ? 3 : 0"
        :key="`s-${i}`"
        class="surface-border flex items-center gap-3 rounded-(--ui-radius) p-4"
      >
        <USkeleton class="size-8 rounded-full" />
        <div class="flex-1">
          <USkeleton class="h-4 w-1/4" />
          <USkeleton class="mt-2 h-3 w-1/3" />
        </div>
      </div>
      <div
        v-for="u in users"
        :key="u.id"
        class="surface-border flex items-center justify-between gap-4 rounded-(--ui-radius) p-4"
      >
        <div class="flex min-w-0 items-center gap-3">
          <UAvatar :alt="u.full_name" size="sm" />
          <div class="min-w-0">
            <p class="truncate font-semibold">
              {{ u.full_name }}
              <span v-if="u.isSelf" class="text-xs text-muted">({{ $t('admin.you') }})</span>
            </p>
            <p class="truncate text-sm text-muted">{{ u.email }}</p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <UBadge v-if="u.banned" color="error" variant="soft">{{ $t('admin.banned') }}</UBadge>
          <UBadge :color="u.role === 'admin' ? 'primary' : 'neutral'" variant="soft">
            {{ $t(`common.role.${u.role}`) }}
          </UBadge>
          <UDropdownMenu v-if="!u.isSelf" :items="actionsFor(u)">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              variant="ghost"
              color="neutral"
              :aria-label="$t('admin.actions')"
            />
          </UDropdownMenu>
        </div>
      </div>
    </div>
  </UContainer>
</template>
