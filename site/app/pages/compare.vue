<script setup lang="ts">
definePageMeta({ layout: 'default' })

const page = useDesignedPageSeo('/compare')

// Rows read as "what each side actually does", not "us good, them bad". Where
// GStack is behind, the row says so — see the `edge` field.
const t3 = [
  {
    aspect: 'Where authorization lives',
    gstack: 'Postgres Row Level Security. The database filters before the app sees rows.',
    other: 'Application code — tRPC procedures and middleware you write and must keep writing.',
    edge: 'gstack',
  },
  {
    aspect: 'Framework',
    gstack: 'Nuxt 4 and Vue.',
    other: 'Next.js and React.',
    edge: 'neither',
  },
  {
    aspect: 'Type safety',
    gstack: 'Generated from the Postgres schema. No ORM.',
    other: 'Prisma or Drizzle plus tRPC, inferred end to end.',
    edge: 'neither',
  },
  {
    aspect: 'Multi-tenancy',
    gstack: 'Built in, with a test that fails if it regresses.',
    other: 'Not included — you design it.',
    edge: 'gstack',
  },
  {
    aspect: 'Ecosystem and answers',
    gstack: 'One repository, one maintainer.',
    other: 'Enormous. Almost any question you have is already answered somewhere.',
    edge: 'other',
  },
]

const kits = [
  {
    aspect: 'Auth, i18n, testing',
    gstack: 'Included, with the tests actually wired into CI.',
    other: 'Included.',
    edge: 'neither',
  },
  {
    aspect: 'Multi-tenancy',
    gstack: 'RLS-enforced and proven by an end-to-end test.',
    other: 'Usually single-tenant, or tenancy scoped in app code.',
    edge: 'gstack',
  },
  {
    aspect: 'Accessibility',
    gstack: 'axe over every page in both themes, on a schedule.',
    other: 'Rarely tested, almost never in CI.',
    edge: 'gstack',
  },
  {
    aspect: 'Observability and release automation',
    gstack: 'Sentry, log forwarding, web vitals, release-please — all flag-gated.',
    other: 'Varies; often left as an exercise.',
    edge: 'gstack',
  },
  {
    aspect: 'Prebuilt UI surface',
    gstack: 'One reference CRUD feature and the shell around it.',
    other: 'Dozens of prebuilt screens, blocks and marketing templates.',
    edge: 'other',
  },
  {
    aspect: 'Support',
    gstack: 'GitHub issues, best effort.',
    other: 'You are paying someone, and can expect a reply.',
    edge: 'other',
  },
]

const against = [
  {
    title: 'You are not building multi-tenant SaaS',
    body: 'The tenancy model is the spine of this thing — every table, every policy, the signup trigger. For a single-tenant app it is weight you would spend the first week removing.',
  },
  {
    title: 'You want React',
    body: 'This is Nuxt and Vue on purpose, and it is not framework-agnostic. Nothing here ports cleanly.',
  },
  {
    title: 'You want someone to call',
    body: 'It is MIT, maintained by one person, and young. A commercial kit with a support contract is a legitimate answer to that.',
  },
  {
    title: 'You need passkeys today',
    body: 'WebAuthn is deferred — it needs real authenticator hardware to test honestly, and an untested auth path is worse than an absent one.',
  },
]

const edgeLabel: Record<string, { text: string, class: string }> = {
  gstack: { text: 'GStack', class: 'text-success' },
  other: { text: 'They lead', class: 'text-primary' },
  neither: { text: 'Even', class: 'text-dimmed' },
}
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

    <!-- 01 vs create-t3-app -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[0]!" />

      <div class="mt-10 overflow-x-auto">
        <table class="w-full min-w-3xl text-sm">
          <thead>
            <tr class="border-b border-default text-left">
              <th class="py-2 pe-4 font-semibold text-highlighted w-56">
                &nbsp;
              </th>
              <th class="py-2 pe-4 font-semibold text-highlighted">
                GStack
              </th>
              <th class="py-2 pe-4 font-semibold text-highlighted">
                create-t3-app
              </th>
              <th class="py-2 font-semibold text-highlighted w-28">
                Edge
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in t3"
              :key="row.aspect"
              class="border-b border-default/60 align-top"
            >
              <td class="py-3 pe-4 text-highlighted">
                {{ row.aspect }}
              </td>
              <td class="py-3 pe-4 text-muted">
                {{ row.gstack }}
              </td>
              <td class="py-3 pe-4 text-muted">
                {{ row.other }}
              </td>
              <td
                class="py-3 font-mono text-xs whitespace-nowrap"
                :class="edgeLabel[row.edge]!.class"
              >
                {{ edgeLabel[row.edge]!.text }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UContainer>

    <!-- 02 vs commercial kits -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[1]!" />

      <div class="mt-10 overflow-x-auto">
        <table class="w-full min-w-3xl text-sm">
          <thead>
            <tr class="border-b border-default text-left">
              <th class="py-2 pe-4 font-semibold text-highlighted w-56">
                &nbsp;
              </th>
              <th class="py-2 pe-4 font-semibold text-highlighted">
                GStack
              </th>
              <th class="py-2 pe-4 font-semibold text-highlighted">
                Commercial Nuxt kits
              </th>
              <th class="py-2 font-semibold text-highlighted w-28">
                Edge
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in kits"
              :key="row.aspect"
              class="border-b border-default/60 align-top"
            >
              <td class="py-3 pe-4 text-highlighted">
                {{ row.aspect }}
              </td>
              <td class="py-3 pe-4 text-muted">
                {{ row.gstack }}
              </td>
              <td class="py-3 pe-4 text-muted">
                {{ row.other }}
              </td>
              <td
                class="py-3 font-mono text-xs whitespace-nowrap"
                :class="edgeLabel[row.edge]!.class"
              >
                {{ edgeLabel[row.edge]!.text }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="mt-6 max-w-3xl text-sm text-muted">
        Billing used to be the obvious gap here and no longer is — Polar
        checkout, the customer portal and webhooks all ship behind
        <code class="font-mono text-primary">NUXT_PUBLIC_BILLING_ENABLED</code>.
      </p>
    </UContainer>

    <!-- 03 Reasons not to -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[2]!" />

      <div class="mt-10 grid gap-4 sm:grid-cols-2">
        <div
          v-for="item in against"
          :key="item.title"
          class="rounded-[var(--ui-radius)] border border-default bg-muted/40 p-5"
        >
          <p class="font-medium text-highlighted">
            {{ item.title }}
          </p>
          <p class="mt-1.5 text-sm text-muted">
            {{ item.body }}
          </p>
        </div>
      </div>
    </UContainer>

    <!-- CTA -->
    <UContainer class="pb-24">
      <div class="flex flex-col items-start gap-6 rounded-[var(--ui-radius)] border border-default bg-muted/40 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xl font-semibold text-highlighted">
            Still the right fit?
          </p>
          <p class="mt-1 text-muted">
            The stack page lists every subsystem and what each one costs to turn on.
          </p>
        </div>
        <UButton
          to="/stack"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          label="See the stack"
        />
      </div>
    </UContainer>
  </div>
</template>
