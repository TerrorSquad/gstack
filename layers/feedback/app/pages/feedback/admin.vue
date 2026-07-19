<script setup lang="ts">
import type { Feedback } from '#shared/types'

// Admin view of tenant feedback. RLS returns the whole tenant's rows to admins,
// the user's own to members — the page-meta role gate is UX only. Reads via the
// same useFeedback().list() the composable exposes.
definePageMeta({ roles: ['admin'] })

const { t } = useI18n()
const { list } = useFeedback()
useHead({ title: () => t('feedback.adminTitle') })

// Client-only: list() uses the browser Supabase client, which only has the
// session on the client (not during SSR) — same reason the admin users page
// uses useFetch. server:false avoids an empty SSR fetch getting cached.
const { data: items, pending } = await useAsyncData<Feedback[]>('admin-feedback', () => list(), {
  server: false,
})
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold">{{ t('feedback.adminTitle') }}</h1>
    <p class="mt-1 text-sm text-muted">{{ t('feedback.adminSubtitle') }}</p>

    <div v-if="pending" class="mt-8 flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="surface-border rounded-(--ui-radius) p-4">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="mt-2 h-3 w-1/4" />
      </div>
    </div>
    <div
      v-else-if="!items?.length"
      class="mt-8 flex flex-col items-center gap-3 py-16 text-center text-muted"
    >
      <UIcon name="i-lucide-message-square" class="size-10" />
      <p>{{ t('feedback.adminEmpty') }}</p>
    </div>
    <div v-else v-auto-animate class="mt-8 flex flex-col gap-3">
      <div
        v-for="f in items"
        :key="f.id"
        class="surface-border rounded-(--ui-radius) p-4"
      >
        <p class="whitespace-pre-line">{{ f.message }}</p>
        <p class="mt-2 flex gap-2 text-xs text-muted">
          <span>{{ formatDate(f.createdAt.slice(0, 10)) }}</span>
          <span v-if="f.page">· {{ f.page }}</span>
        </p>
      </div>
    </div>
  </UContainer>
</template>
