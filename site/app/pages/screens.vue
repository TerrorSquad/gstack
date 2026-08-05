<script setup lang="ts">
definePageMeta({ layout: 'default' })

const page = useDesignedPageSeo('/screens')

// Captured by `pnpm screenshots` in the starter repo (Playwright against a
// seeded local Supabase) and copied into public/screens/. They are generated,
// not art-directed — if a screen regresses, the picture regresses with it.
const app = [
  { file: 'dashboard', title: 'Dashboard', note: 'Recent notes, counts, and the shell every signed-in page sits in.' },
  { file: 'notes', title: 'Notes — the reference CRUD', note: 'Search, create, edit, delete. No tenant filter in the query; RLS did it.' },
  { file: 'admin', title: 'Tenant admin', note: 'Member table with role changes, invites, ban and impersonate.' },
  { file: 'billing', title: 'Billing', note: 'Plan state, checkout and the customer portal, behind one flag.' },
  { file: 'account', title: 'Account', note: 'Avatar upload to Supabase Storage, email change, self-serve deletion.' },
  { file: 'feedback', title: 'Feedback', note: 'Self-hosted widget writing to your own RLS-scoped table.' },
]

const publicScreens = [
  { file: 'pricing', title: 'Pricing', note: 'Data-driven from app/utils/plans.ts — the plan id is the billing seam.' },
  { file: 'changelog', title: 'Changelog', note: 'The user-facing feed, separate from the release-please one.' },
]

const theme = ref<'dark' | 'light'>('dark')
</script>

<template>
  <div>
    <!-- Hero -->
    <UContainer class="grid-surface relative pt-16 pb-12 sm:pt-24 sm:pb-16">
      <p class="font-mono text-xs uppercase tracking-[0.18em] text-primary">
        {{ page.eyebrow }}
      </p>
      <h1 class="mt-4 max-w-3xl text-4xl sm:text-6xl font-bold tracking-tight text-highlighted text-pretty">
        {{ page.heading }}
      </h1>
      <p class="mt-6 max-w-2xl text-lg text-muted text-pretty">
        {{ page.intro }}
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <UButton
          :to="'/docs/getting-started/installation'"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          label="Run it yourself"
        />
        <span class="text-sm text-dimmed">
          No hosted demo — five commands and it's on localhost:3000.
        </span>
      </div>
    </UContainer>

    <!-- 01 The app -->
    <UContainer class="py-16 sm:py-24">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <SectionHead v-bind="page.sections[0]!" />

        <div class="flex rounded-[var(--ui-radius)] border border-default p-1">
          <button
            v-for="t in (['dark', 'light'] as const)"
            :key="t"
            type="button"
            class="rounded-[calc(var(--ui-radius)-2px)] px-3 py-1 font-mono text-xs uppercase tracking-[0.14em] transition-colors"
            :class="theme === t ? 'bg-primary text-inverted' : 'text-muted hover:text-highlighted'"
            :aria-pressed="theme === t"
            @click="theme = t"
          >
            {{ t }}
          </button>
        </div>
      </div>

      <div class="mt-10 grid gap-8 lg:grid-cols-2">
        <figure
          v-for="shot in app"
          :key="shot.file"
        >
          <img
            :src="`/screens/${shot.file}-${theme}.png`"
            :alt="`${shot.title} — GStack, ${theme} theme`"
            width="1920"
            height="1080"
            loading="lazy"
            class="w-full rounded-[var(--ui-radius)] border border-default"
          >
          <figcaption class="mt-3">
            <p class="font-medium text-highlighted">
              {{ shot.title }}
            </p>
            <p class="mt-0.5 text-sm text-muted">
              {{ shot.note }}
            </p>
          </figcaption>
        </figure>
      </div>
    </UContainer>

    <!-- 02 Public + mobile -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[1]!" />

      <div class="mt-10 grid gap-8 lg:grid-cols-2">
        <figure
          v-for="shot in publicScreens"
          :key="shot.file"
        >
          <img
            :src="`/screens/${shot.file}-${theme}.png`"
            :alt="`${shot.title} — GStack, ${theme} theme`"
            width="1920"
            height="1080"
            loading="lazy"
            class="w-full rounded-[var(--ui-radius)] border border-default"
          >
          <figcaption class="mt-3">
            <p class="font-medium text-highlighted">
              {{ shot.title }}
            </p>
            <p class="mt-0.5 text-sm text-muted">
              {{ shot.note }}
            </p>
          </figcaption>
        </figure>
      </div>

      <div class="mt-12 flex flex-wrap items-start gap-8">
        <figure
          v-for="m in [{ file: 'mobile-dashboard', title: 'Dashboard' }, { file: 'mobile-notes', title: 'Notes' }]"
          :key="m.file"
          class="w-44"
        >
          <img
            :src="`/screens/${m.file}.png`"
            :alt="`${m.title} on a phone — GStack`"
            width="412"
            height="915"
            loading="lazy"
            class="w-full rounded-[var(--ui-radius)] border border-default"
          >
          <figcaption class="mt-3 text-sm text-muted">
            {{ m.title }} · Pixel 7
          </figcaption>
        </figure>
      </div>
    </UContainer>

    <!-- CTA -->
    <UContainer class="pb-24">
      <div class="flex flex-col items-start gap-6 rounded-[var(--ui-radius)] border border-default bg-muted/40 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xl font-semibold text-highlighted">
            These are captured, not curated.
          </p>
          <p class="mt-1 text-muted">
            <code class="font-mono text-primary">pnpm screenshots</code> drives every route in both themes plus a mobile pass. Regenerating is one command.
          </p>
        </div>
        <UButton
          to="/stack"
          size="lg"
          color="neutral"
          variant="subtle"
          trailing-icon="i-lucide-arrow-right"
          label="What powers them"
        />
      </div>
    </UContainer>
  </div>
</template>
