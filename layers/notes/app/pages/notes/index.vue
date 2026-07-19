<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('nav.notes') })

const { notes, pending, deleteNote } = useNotes()
const { confirm } = useConfirm()

async function remove(id: string) {
  if (await confirm(t('notes.confirmDelete'))) await deleteNote(id)
}

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return notes.value
  return notes.value.filter(
    (n) => n.title.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q),
  )
})
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ $t('notes.title') }}</h1>
      <UButton to="/notes/new" icon="i-lucide-plus">{{ $t('notes.new') }}</UButton>
    </div>

    <UInput
      v-if="notes.length"
      v-model="query"
      icon="i-lucide-search"
      :placeholder="$t('notes.search')"
      class="mt-6 w-full sm:max-w-xs"
    />

    <div v-if="pending" class="mt-8 flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="surface-border rounded-(--ui-radius) p-4">
        <USkeleton class="h-5 w-1/3" />
        <USkeleton class="mt-2 h-4 w-2/3" />
      </div>
    </div>

    <div
      v-else-if="!notes.length"
      class="mt-8 flex flex-col items-center gap-3 py-16 text-center text-muted"
    >
      <UIcon name="i-lucide-notebook-pen" class="size-10" />
      <p>{{ $t('notes.empty') }}</p>
      <UButton to="/notes/new" icon="i-lucide-plus" variant="subtle" class="mt-2">
        {{ $t('notes.new') }}
      </UButton>
    </div>

    <div v-else-if="!filtered.length" class="mt-8 py-16 text-center text-muted">
      {{ $t('notes.noResults') }}
    </div>

    <div v-else v-auto-animate class="mt-8 flex flex-col gap-3">
      <UCard v-for="note in filtered" :key="note.id">
        <div class="flex items-start justify-between gap-4">
          <NuxtLink :to="`/notes/${note.id}`" class="min-w-0 flex-1">
            <p class="truncate font-semibold">{{ note.title }}</p>
            <p class="mt-1 line-clamp-2 text-sm text-muted">{{ note.body || '—' }}</p>
            <p class="mt-2 text-xs text-muted">{{ formatDate(note.updatedAt.slice(0, 10)) }}</p>
          </NuxtLink>
          <UButton
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            :aria-label="$t('common.delete')"
            @click="remove(note.id)"
          />
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
