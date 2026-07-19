<script setup lang="ts">
// Dev-only email preview. Lists every registered template and renders the
// selected one (with its sample props) in an iframe via the server preview
// endpoint. Public route so you don't have to log in to eyeball an email; the
// endpoints themselves 404 in production, so this page is empty there.
definePageMeta({ public: true })
useHead({ title: 'Email preview' })

const { data: templates } = await useFetch('/api/dev/email-list')
const selected = ref(templates.value?.[0]?.id ?? '')
const src = computed(() => `/api/dev/email-preview?id=${selected.value}`)
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold mb-4">Email preview</h1>
    <div v-if="!templates?.length" class="text-muted">
      No templates registered, or this is a production build (preview is dev-only).
    </div>
    <template v-else>
      <div class="flex gap-2 mb-4">
        <UButton
          v-for="t in templates"
          :key="t.id"
          :variant="t.id === selected ? 'solid' : 'outline'"
          @click="selected = t.id"
        >
          {{ t.label }}
        </UButton>
      </div>
      <iframe :src="src" class="w-full h-[720px] rounded-lg border border-default bg-white" title="Email preview" />
    </template>
  </UContainer>
</template>
