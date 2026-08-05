<script setup lang="ts">
definePageMeta({ layout: 'default' })

const page = useDesignedPageSeo('/stack')

// Facts (flag, category, whether keys are needed) come from the starter's
// subsystem manifest via app/utils/integrations.ts. Only the per-category
// framing below is editorial. Adding a subsystem to the manifest without copy
// fails the build rather than quietly omitting it here.
const CATEGORY_BLURB: Record<string, string> = {
  Core: 'Always on. No flag, because without it there is no app.',
  Security: 'No flag — present the keys and the buttons start working.',
  Growth: 'The subsystems that grow the product. Two of them are self-hosted and cost nothing.',
  Billing: 'Behind an adapter, so the provider is replaceable.',
  Observability: 'Also keyed rather than flagged: no DSN, no reporting.',
}

// Derived, so a subsystem that stops being self-hosted can't linger here as a
// promise the manifest no longer makes.
const freeForever = computed(() => [
  'Auth, roles and RLS multi-tenancy',
  'Notes CRUD as the reference feature',
  ...subsystems.filter(s => s.account === null && s.category !== 'core').map(s => s.label),
  'i18n, accessibility checks and the test suite',
])

const setupSnippet = `$ pnpm setup

  Which subsystems do you want?
  ◉ Feedback widget      (no account needed)
  ◉ Onboarding tour      (no account needed)
  ◯ Notifications        (Resend)
  ◯ Billing              (Polar)

  wrote .env

$ pnpm doctor
  ✓ supabase        4 vars set
  ✓ feedback        enabled, no keys required
  ! notifications   disabled`
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

    <!-- 01 Zero accounts -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[0]!" />

      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="item in freeForever"
          :key="item"
          class="rounded-[var(--ui-radius)] border border-success/40 bg-success/5 p-5"
        >
          <UIcon
            name="i-lucide-check"
            class="size-5 text-success"
          />
          <p class="mt-3 text-sm text-toned">
            {{ item }}
          </p>
        </div>
      </div>

      <p class="mt-6 max-w-3xl text-sm text-muted">
        Supabase runs in Docker via <code class="font-mono text-primary">pnpm supabase start</code>,
        so even the database is local. The first account you create is the one
        you choose to create.
      </p>
    </UContainer>

    <!-- 02 The subsystems -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[1]!" />

      <div class="mt-10 space-y-10">
        <div
          v-for="group in subsystemGroups"
          :key="group.category"
        >
          <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-default pb-3">
            <h3 class="font-mono text-sm uppercase tracking-[0.14em] text-primary">
              {{ group.label }}
            </h3>
            <p class="text-sm text-muted">
              {{ CATEGORY_BLURB[group.label] }}
            </p>
          </div>

          <div class="mt-4 grid gap-4 lg:grid-cols-2">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="rounded-[var(--ui-radius)] border border-default bg-muted/40 p-5"
            >
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-medium text-highlighted">
                  {{ item.label }}
                </p>
                <UBadge
                  v-if="item.account"
                  :label="`needs ${item.account}`"
                  color="neutral"
                  variant="soft"
                  size="sm"
                />
                <UBadge
                  v-else
                  label="no account"
                  color="success"
                  variant="soft"
                  size="sm"
                />
              </div>

              <p class="mt-2 text-sm text-muted">
                {{ item.blurb }}
              </p>

              <p class="mt-3 font-mono text-xs text-dimmed">
                {{ item.flag
                  ?? (item.category === 'core'
                    ? 'core — always on'
                    : `no flag — set ${item.requiredKeys.length} keys`) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- 03 setup/doctor -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[2]!" />

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <CodeCard
          file="terminal"
          lang="bash"
          :code="setupSnippet"
        />

        <div class="flex flex-col justify-center gap-4">
          <p class="text-muted">
            Unpicked subsystems are set to
            <code class="font-mono text-primary">false</code>, never deleted, and
            existing values are never overwritten — so re-running
            <code class="font-mono text-primary">setup</code> after you have
            edited <code class="font-mono text-primary">.env</code> by hand is
            safe.
          </p>
          <p class="text-muted">
            <code class="font-mono text-primary">doctor</code> fails on a missing
            required key and warns on a missing optional one, which is how a
            half-configured subsystem gets caught before it is deployed rather
            than after.
          </p>
        </div>
      </div>
    </UContainer>

    <!-- 04 Deploy -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[3]!" />

      <div class="mt-10 grid gap-4 sm:grid-cols-3">
        <div class="rounded-[var(--ui-radius)] border border-default bg-muted/40 p-5">
          <p class="font-medium text-highlighted">
            Portable by construction
          </p>
          <p class="mt-1.5 text-sm text-muted">
            Swap the Nitro preset and deploy elsewhere. The only Vercel-specific
            pieces are the analytics and speed-insights modules, and both no-op
            off Vercel.
          </p>
        </div>
        <div class="rounded-[var(--ui-radius)] border border-default bg-muted/40 p-5">
          <p class="font-medium text-highlighted">
            Supabase, hosted or not
          </p>
          <p class="mt-1.5 text-sm text-muted">
            The same migrations run against a local Docker stack and a hosted
            project. Self-host the whole thing if you'd rather.
          </p>
        </div>
        <div class="rounded-[var(--ui-radius)] border border-default bg-muted/40 p-5">
          <p class="font-medium text-highlighted">
            Migrations, not snapshots
          </p>
          <p class="mt-1.5 text-sm text-muted">
            Schema changes are ordered SQL files. After changing one, regenerate
            types or typecheck fails — the schema can't silently drift from the
            code.
          </p>
        </div>
      </div>
    </UContainer>

    <!-- CTA -->
    <UContainer class="pb-24">
      <div class="flex flex-col items-start gap-6 rounded-[var(--ui-radius)] border border-default bg-muted/40 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xl font-semibold text-highlighted">
            Ready to wire one of these up?
          </p>
          <p class="mt-1 text-muted">
            The configuration reference has the exact variables and the webhook
            steps for each subsystem.
          </p>
        </div>
        <UButton
          to="/docs/getting-started/configuration"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          label="Configuration reference"
        />
      </div>
    </UContainer>
  </div>
</template>
