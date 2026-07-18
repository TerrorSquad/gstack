<script setup lang="ts">
const auth = useAuthStore()
const { t } = useI18n()

useHead({ title: () => t('nav.dashboard') })

// Example authenticated data read, RLS-scoped to the current user.
const { notes, pending } = useNotes()
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold">
      {{ $t('dashboard.greeting', { name: auth.profile?.fullName ?? '' }) }}
    </h1>
    <p class="mt-1 text-muted">{{ $t('dashboard.subtitle') }}</p>

    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-notebook-pen" class="size-8 text-primary" />
          <div>
            <p class="text-3xl font-bold">{{ pending ? '…' : notes.length }}</p>
            <p class="text-sm text-muted">{{ $t('dashboard.noteCount') }}</p>
          </div>
        </div>
        <template #footer>
          <UButton to="/notes" variant="subtle" trailing-icon="i-lucide-arrow-right" block>
            {{ $t('dashboard.openNotes') }}
          </UButton>
        </template>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-user" class="size-8 text-primary" />
          <div>
            <p class="text-lg font-semibold">{{ auth.profile?.email }}</p>
            <p class="text-sm text-muted">{{ $t(`common.role.${auth.profile?.role}`) }}</p>
          </div>
        </div>
        <template #footer>
          <UButton to="/account" variant="subtle" trailing-icon="i-lucide-arrow-right" block>
            {{ $t('nav.account') }}
          </UButton>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>
