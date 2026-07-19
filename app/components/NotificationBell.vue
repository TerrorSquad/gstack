<script setup lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'

import type { Notification } from '#shared/types'

const store = useNotificationsStore()
const supabase = useSupabaseClient()
const { t } = useI18n()
const NuxtLink = resolveComponent('NuxtLink')

await store.ensureLoaded()

// Resolve actor names + note titles without typed embeds (the hand-written DB
// types carry no relationships). Two lightweight `.in()` lookups, RLS-scoped.
const actorNames = ref<Record<string, string>>({})
const noteTitles = ref<Record<string, string>>({})

async function resolveRefs() {
  const actorIds = [...new Set(store.notifications.map((n) => n.actorId).filter(Boolean))] as string[]
  const noteIds = [...new Set(store.notifications.map((n) => n.noteId).filter(Boolean))] as string[]
  if (actorIds.length) {
    const { data } = await supabase.from('profiles').select('id, full_name').in('id', actorIds)
    actorNames.value = Object.fromEntries((data ?? []).map((p) => [p.id, p.full_name]))
  }
  if (noteIds.length) {
    const { data } = await supabase.from('notes').select('id, title').in('id', noteIds)
    noteTitles.value = Object.fromEntries((data ?? []).map((n) => [n.id, n.title]))
  }
}
await resolveRefs()

function message(n: Notification) {
  return t('notifications.noteCreated', {
    name: n.actorId ? (actorNames.value[n.actorId] ?? '?') : '?',
    title: n.noteId ? (noteTitles.value[n.noteId] ?? '') : '',
  })
}

function relativeTime(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

async function onOpenChange(open: boolean) {
  if (!open) return
  await store.markAllRead()
}
</script>

<template>
  <UPopover @update:open="onOpenChange">
    <UChip
      :text="store.unreadCount"
      :show="store.unreadCount > 0"
      color="error"
      size="sm"
    >
      <UTooltip :text="$t('notifications.label')">
        <UButton
          icon="i-lucide-bell"
          size="xs"
          variant="ghost"
          color="neutral"
          :aria-label="$t('notifications.label')"
        />
      </UTooltip>
    </UChip>

    <template #content>
      <div class="flex max-h-96 w-80 flex-col overflow-y-auto p-2">
        <p class="px-2 py-1 text-xs font-medium text-muted">{{ $t('notifications.label') }}</p>
        <component
          :is="n.noteId ? NuxtLink : 'div'"
          v-for="n in store.notifications"
          :key="n.id"
          :to="n.noteId ? `/notes/${n.noteId}` : undefined"
          class="flex items-start gap-2 rounded-md p-2"
          :class="[!n.readAt ? 'bg-primary/10' : '', n.noteId ? 'hover:bg-muted/60' : '']"
        >
          <UIcon name="i-lucide-notebook-pen" class="mt-0.5 size-4 shrink-0 text-muted" />
          <div class="flex-1 text-sm">
            <p>{{ message(n) }}</p>
            <p class="text-xs text-dimmed">{{ relativeTime(n.createdAt) }}</p>
          </div>
        </component>
        <p
          v-if="store.notifications.length === 0"
          class="px-2 py-4 text-center text-sm text-muted"
        >
          {{ $t('notifications.empty') }}
        </p>
      </div>
    </template>
  </UPopover>
</template>
