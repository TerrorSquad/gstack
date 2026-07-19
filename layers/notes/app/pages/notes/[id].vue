<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const id = route.params.id as string

const { getNote, updateNote } = useNotes()

const note = await getNote(id)
if (!note) throw createError({ statusCode: 404, statusMessage: 'Note not found' })

useHead({ title: () => note.title })

const title = ref(note.title)
const body = ref(note.body)
const loading = ref(false)
const error = ref('')

const { confirm } = useConfirm()
const saved = ref(false)

onBeforeRouteLeave(async () => {
  if (saved.value) return true
  if (title.value === note.title && body.value === note.body) return true
  return await confirm(t('notes.unsavedConfirm'))
})

async function submit() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = t('notes.titleRequired')
    return
  }
  loading.value = true
  try {
    await updateNote(id, title.value.trim(), body.value)
    saved.value = true
    await navigateTo('/notes')
  } catch {
    error.value = t('common.saveError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-2xl py-8">
    <h1 class="text-2xl font-bold">{{ $t('notes.edit') }}</h1>

    <form class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
      <UFormField :label="$t('notes.fieldTitle')">
        <UInput v-model="title" class="w-full" required />
      </UFormField>
      <UFormField :label="$t('notes.fieldBody')">
        <UTextarea v-model="body" :rows="8" class="w-full" />
      </UFormField>
      <UAlert v-if="error" color="error" :title="error" />
      <div class="flex gap-3">
        <UButton to="/notes" variant="ghost" color="neutral">{{ $t('common.cancel') }}</UButton>
        <UButton type="submit" :loading="loading">{{ $t('common.save') }}</UButton>
      </div>
    </form>
  </UContainer>
</template>
