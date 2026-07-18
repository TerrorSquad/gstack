<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('nav.notes') })

const { notes, pending, deleteNote } = useNotes()
const { confirm } = useConfirm()

async function remove(id: string) {
  if (await confirm(t('notes.confirmDelete'))) await deleteNote(id)
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ $t('notes.title') }}</h1>
      <UButton to="/notes/new" icon="i-lucide-plus">{{ $t('notes.new') }}</UButton>
    </div>

    <div v-if="pending" class="mt-8 text-muted">{{ $t('common.loading') }}</div>

    <div
      v-else-if="!notes.length"
      class="mt-8 flex flex-col items-center gap-3 py-16 text-center text-muted"
    >
      <UIcon name="i-lucide-notebook-pen" class="size-10" />
      <p>{{ $t('notes.empty') }}</p>
    </div>

    <div v-else class="mt-8 flex flex-col gap-3">
      <UCard v-for="note in notes" :key="note.id">
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
