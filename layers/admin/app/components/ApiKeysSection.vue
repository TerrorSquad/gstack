<script setup lang="ts">
import type { Database } from '#shared/types/database.types'

// API keys for integrations: a read-only REST API at /api/v1 (server/api/v1). The key is shown once.
const { t } = useI18n()
const supabase = useSupabaseClient<Database>()
const toast = useToast()
const showError = (e: { message: string }) => toast.add({ title: e.message, color: 'error' })
const rows = ref<Database['public']['Tables']['api_key']['Row'][]>([])
const name = ref('')
const fresh = ref('')

async function load() {
  const { data, error } = await supabase
    .from('api_key')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return showError(error)
  rows.value = data
}
onMounted(load)
async function create() {
  const { data, error } = await supabase.rpc('create_api_key', { p_name: name.value })
  if (error) return showError(error)
  fresh.value = data
  name.value = ''
  await load()
}
async function revoke(id: string) {
  const { error } = await supabase.rpc('revoke_api_key', { p_id: id })
  if (error) return showError(error)
  await load()
}
const when = (v: string | null) => formatDateTime(v)
</script>

<template>
  <UCard data-testid="api-keys">
    <h2 class="mb-1 font-semibold">{{ t('apiKeys.title') }}</h2>
    <p class="mb-3 text-sm text-muted">{{ t('apiKeys.help') }} <code>/api/v1/notes</code></p>
    <form class="flex gap-2" @submit.prevent="create">
      <UInput
        v-model="name"
        :placeholder="t('apiKeys.name')"
        class="flex-1"
        data-testid="api-key-name"
      />
      <UButton
        type="submit"
        icon="i-lucide-key-round"
        :disabled="!name.trim()"
        data-testid="api-key-create"
        >{{ t('apiKeys.create') }}</UButton
      >
    </form>
    <UAlert
      v-if="fresh"
      class="mt-3"
      color="warning"
      variant="subtle"
      :title="t('apiKeys.copyNow')"
    >
      <template #description
        ><code class="break-all" data-testid="api-key-value">{{ fresh }}</code></template
      >
    </UAlert>
    <ul class="mt-3 divide-y divide-default text-sm">
      <li v-for="k in rows" :key="k.id" class="flex items-center gap-3 py-2">
        <div class="min-w-0 flex-1">
          <p>
            {{ k.name }} <code class="text-muted">{{ k.prefix }}…</code>
          </p>
          <p class="text-muted">{{ t('apiKeys.lastUsed') }}: {{ when(k.last_used_at) }}</p>
        </div>
        <UBadge v-if="k.revoked_at" color="neutral" variant="subtle">{{
          t('apiKeys.revoked')
        }}</UBadge>
        <UButton v-else size="xs" variant="ghost" color="error" @click="revoke(k.id)">{{
          t('apiKeys.revoke')
        }}</UButton>
      </li>
    </ul>
  </UCard>
</template>
