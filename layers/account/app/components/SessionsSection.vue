<script setup lang="ts">
import type { Database } from '#shared/types/database.types'

// Signed-in devices: see where you are logged in, end a session on another device, or sign out everywhere else.
const { t } = useI18n()
const supabase = useSupabaseClient<Database>()
const toast = useToast()
const showError = (e: { message: string }) => toast.add({ title: e.message, color: 'error' })
const rows = ref<Database['public']['Functions']['my_sessions']['Returns']>([])

async function load() {
  const { data, error } = await supabase.rpc('my_sessions')
  if (error) return showError(error)
  rows.value = data
}
onMounted(load)
async function end(id: string) {
  const { error } = await supabase.rpc('end_session', { p_id: id })
  if (error) return showError(error)
  await load()
}
async function endOthers() {
  const { error } = await supabase.auth.signOut({ scope: 'others' })
  if (error) return showError(error)
  await load()
}
</script>

<template>
  <UCard data-testid="sessions-section">
    <h2 class="mb-1 font-semibold">{{ t('sessions.title') }}</h2>
    <p class="mb-3 text-sm text-muted">{{ t('sessions.help') }}</p>
    <ul class="divide-y divide-default text-sm">
      <li
        v-for="s in rows"
        :key="s.id"
        class="flex items-center justify-between gap-3 py-2"
        data-testid="session-row"
      >
        <div class="min-w-0">
          <p class="truncate">{{ s.user_agent || t('sessions.unknownDevice') }}</p>
          <p class="text-muted">{{ s.ip }} · {{ formatDateTime(s.last_seen) }}</p>
        </div>
        <UBadge v-if="s.current" variant="subtle">{{ t('sessions.thisDevice') }}</UBadge>
        <UButton v-else size="xs" variant="ghost" color="error" @click="end(s.id)">{{
          t('sessions.end')
        }}</UButton>
      </li>
    </ul>
    <UButton
      v-if="rows.length > 1"
      class="mt-3"
      variant="outline"
      data-testid="sessions-end-others"
      @click="endOthers"
      >{{ t('sessions.endOthers') }}</UButton
    >
  </UCard>
</template>
