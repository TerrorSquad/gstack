<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('notes.new') })

const { createNote } = useNotes()

const title = ref('')
const body = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = t('notes.titleRequired')
    return
  }
  loading.value = true
  try {
    await createNote(title.value.trim(), body.value)
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
    <h1 class="text-2xl font-bold">{{ $t('notes.new') }}</h1>

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
