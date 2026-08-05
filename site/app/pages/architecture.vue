<script setup lang="ts">
definePageMeta({ layout: 'default' })

const page = useDesignedPageSeo('/architecture')

// Mirrors the `extends` array in the starter's root nuxt.config.ts, in order.
// `ui` is listed first there for a reason — it's the design-system foundation
// every other layer themes against.
const layers = [
  { name: 'ui', role: 'Design system — tokens, fonts, brand chrome', foundation: true },
  { name: 'marketing', role: 'Public pages: landing, pricing, legal' },
  { name: 'notes', role: 'Reference CRUD feature' },
  { name: 'admin', role: 'Tenant administration' },
  { name: 'account', role: 'Profile and settings' },
  { name: 'billing', role: 'Polar checkout, portal, webhooks' },
  { name: 'email', role: 'Transactional mail + the shared shell' },
  { name: 'analytics', role: 'PostHog, feature flags' },
  { name: 'feedback', role: 'Self-hosted widget → your own DB' },
  { name: 'tour', role: 'First-run onboarding' },
]

const lifecycle = [
  { step: 'Request', detail: 'SSR request hits Nitro. nuxt-security sets CSP with a per-request nonce.' },
  { step: 'Middleware', detail: 'auth.global.ts guards every non-public route and reads definePageMeta({ roles }).' },
  { step: 'Session', detail: '@nuxtjs/supabase resolves the session from cookies. Module redirects are off — the middleware owns routing.' },
  { step: 'Query', detail: 'The composable queries Supabase as the caller. RLS scopes rows to their tenant in Postgres.' },
  { step: 'Render', detail: 'The page renders rows the database already decided it was allowed to see.' },
]

const extendsSnippet = `export default defineNuxtConfig({
  extends: [
    './layers/ui',
    './layers/marketing',
    './layers/reports',
  ],
})`

const notesSnippet = `import type { Note } from '#shared/types'

// useAsyncData for reads, async mutators
// that refresh() after writing. Owner
// scoping is RLS's job, not this file's.`

const typePipeline = [
  'Postgres schema',
  'supabase gen types',
  'shared/types/database.types.ts',
  'composables (#shared)',
  'components',
]

const deferred = [
  {
    title: 'No ORM',
    body: 'Types generated from the schema already give end-to-end safety. Drizzle waits until server-side query complexity actually demands it.',
    adr: 'ADR-0002',
    to: 'https://github.com/TerrorSquad/gstack/blob/main/docs/adr/0002-data-layer.md',
  },
  {
    title: 'No monorepo',
    body: 'One deployable, so a workspace would be overhead. In-repo layers are not a monorepo — they need no tooling at all.',
    adr: 'ADR-0005',
    to: 'https://github.com/TerrorSquad/gstack/blob/main/docs/adr/0005-nuxt-layers.md',
  },
  {
    title: 'Polar, not Stripe',
    body: 'A Merchant of Record, behind an adapter. Stripe will not onboard sellers in every country the author included.',
    adr: 'ADR-0001',
    to: 'https://github.com/TerrorSquad/gstack/blob/main/docs/adr/0001-payments-provider.md',
  },
]
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
    </UContainer>

    <!-- 01 The shape -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[0]!" />

      <div class="mt-10 space-y-3">
        <div class="rounded-[var(--ui-radius)] border border-accented bg-elevated px-5 py-4">
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-dimmed">
            Root — the shell
          </p>
          <p class="mt-1.5 text-sm text-toned">
            app.vue · layouts · auth pages + global middleware · Pinia stores ·
            shared/types via <code class="font-mono text-primary">#shared</code>
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="layer in layers"
            :key="layer.name"
            class="rounded-[var(--ui-radius)] border bg-muted/40 px-4 py-3.5"
            :class="layer.foundation ? 'border-primary/50 sm:col-span-2 lg:col-span-3' : 'border-default'"
          >
            <p
              class="font-mono text-sm"
              :class="layer.foundation ? 'text-primary' : 'text-highlighted'"
            >
              layers/{{ layer.name }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ layer.role }}
            </p>
          </div>
        </div>
      </div>

      <p class="mt-6 max-w-3xl text-sm text-muted">
        <code class="font-mono text-primary">~</code> and
        <code class="font-mono text-primary">@</code> always resolve to the root
        app, never the current layer — so layers rely on auto-imports rather than
        importing across each other. That is the rule that keeps them detachable.
      </p>
    </UContainer>

    <!-- 02 Adding a feature -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[1]!" />

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <CodeCard
          file="terminal"
          lang="bash"
          code="pnpm gen:layer reports"
        />

        <CodeCard
          file="nuxt.config.ts"
          :code="extendsSnippet"
          :highlight="[5]"
        />
      </div>

      <p class="mt-6 max-w-3xl text-sm text-muted">
        Components, composables, utils, Pinia stores and Nitro
        <code class="font-mono text-primary">server/utils</code> all auto-import
        across layers. Translations stay centralised in the root
        <code class="font-mono text-primary">i18n/locales/*</code>, because a
        per-layer message catalogue is how key parity dies.
      </p>
    </UContainer>

    <!-- 03 Lifecycle -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[2]!" />

      <ol class="mt-10 space-y-px overflow-hidden rounded-[var(--ui-radius)] border border-default">
        <li
          v-for="(item, i) in lifecycle"
          :key="item.step"
          class="flex flex-col gap-1 bg-muted/40 px-5 py-4 sm:flex-row sm:gap-6"
        >
          <div class="flex shrink-0 items-baseline gap-3 sm:w-44">
            <span class="font-mono text-xs text-dimmed">0{{ i + 1 }}</span>
            <span class="font-medium text-highlighted">{{ item.step }}</span>
          </div>
          <p class="text-sm text-muted">
            {{ item.detail }}
          </p>
        </li>
      </ol>
    </UContainer>

    <!-- 04 Types -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[3]!" />

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <div class="flex flex-col justify-center gap-2 rounded-[var(--ui-radius)] border border-default bg-muted/40 p-6">
          <div
            v-for="(stage, i) in typePipeline"
            :key="stage"
            class="flex items-center gap-3"
          >
            <span class="font-mono text-xs text-dimmed w-5">{{ i + 1 }}</span>
            <span
              class="font-mono text-sm"
              :class="i === 2 ? 'text-primary' : 'text-toned'"
            >{{ stage }}</span>
          </div>
        </div>

        <CodeCard
          file="layers/notes/app/composables/useNotes.ts"
          :code="notesSnippet"
          :highlight="[1]"
        />
      </div>
    </UContainer>

    <!-- 05 Deferred -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[4]!" />

      <div class="mt-10 grid gap-4 md:grid-cols-3">
        <ULink
          v-for="item in deferred"
          :key="item.adr"
          :to="item.to"
          target="_blank"
          class="group rounded-[var(--ui-radius)] border border-default bg-muted/40 p-5 transition-colors hover:border-accented"
        >
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-dimmed">
            {{ item.adr }}
          </p>
          <p class="mt-2 font-medium text-highlighted">
            {{ item.title }}
          </p>
          <p class="mt-2 text-sm text-muted">
            {{ item.body }}
          </p>
          <span class="mt-3 inline-flex items-center gap-1 text-sm text-primary">
            Read the decision
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4"
            />
          </span>
        </ULink>
      </div>
    </UContainer>

    <!-- CTA -->
    <UContainer class="pb-24">
      <div class="flex flex-col items-start gap-6 rounded-[var(--ui-radius)] border border-default bg-muted/40 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xl font-semibold text-highlighted">
            Isolation is the other half of the story.
          </p>
          <p class="mt-1 text-muted">
            How RLS, roles and the layers above it actually keep tenants apart.
          </p>
        </div>
        <UButton
          to="/security"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          label="Read about security"
        />
      </div>
    </UContainer>
  </div>
</template>
