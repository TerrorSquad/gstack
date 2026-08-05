<script setup lang="ts">
definePageMeta({ layout: 'default' })

const page = useDesignedPageSeo('/security')

const tenantFn = `create or replace function public.current_tenant_id()
returns uuid
language sql stable security definer
set search_path = public as $$
  select tenant_id from public.profiles
  where id = auth.uid();
$$;`

const notesPolicy = `create policy "notes_select_owner_or_admin"
on public.notes for select using (
  tenant_id = public.current_tenant_id()
  and (
    user_id = auth.uid()
    or public.current_role() = 'admin'
  )
);`

const signupTrigger = `create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function
    public.handle_new_user();

-- Signup creates a tenant and makes
-- the registrant its admin.`

const isolationTest = `test('a Globex admin cannot see Acme notes', async ({ page }) => {
  await login(page, ADMIN2.email)

  await page.goto('/notes')
  await expect(page.getByText(ACME_SECRET_NOTE_TITLE)).toHaveCount(0)
})

test('the notes API returns no Acme rows for a Globex caller', async ({ page }) => {
  await login(page, ADMIN2.email)

  // Hit the data path the app uses and assert the secret title is nowhere
  // in the payload — isolation at the source, not just the rendered list.
  const body = await page.evaluate(() => fetch('/notes').then(r => r.text()))
  expect(body).not.toContain(ACME_SECRET_NOTE_TITLE)
})`

// Everything above RLS. None of it is the security boundary — RLS is — but a
// starter that shipped only RLS would be leaving the ordinary web attack
// surface to the reader.
const hardening = [
  {
    title: 'Content Security Policy',
    detail: 'Nonce-based script-src with strict-dynamic, per request. frame-ancestors none, base-uri self. Every external host the stack talks to is allowlisted per directive rather than wildcarded.',
    icon: 'i-lucide-file-lock-2',
  },
  {
    title: 'CSRF tokens',
    detail: 'Double-submit with an httpOnly secret cookie on POST, PUT and PATCH, layered over SameSite=Lax auth cookies. App calls carry the token automatically.',
    icon: 'i-lucide-repeat-2',
  },
  {
    title: 'Rate limiting',
    detail: 'Upstash Redis where configured, in-memory otherwise — so a bare clone still limits, and a deployed one limits across instances.',
    icon: 'i-lucide-gauge',
  },
  {
    title: 'Machine callers, explicitly',
    detail: 'Webhooks and the Sentry tunnel are CSRF-exempt by route rule and verified by secret in the handler instead. Exemptions are a short, readable list.',
    icon: 'i-lucide-webhook',
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

    <!-- 01 The model -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[0]!" />

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <CodeCard
          file="supabase/migrations/20260101000000_init.sql"
          :code="tenantFn"
          lang="sql"
          :highlight="[3]"
        />

        <div class="flex flex-col justify-center gap-4">
          <p class="text-muted">
            It is <span class="text-highlighted">security definer</span> so it
            can read <code class="font-mono text-primary">profiles</code> to
            answer the question without recursively triggering RLS on
            <code class="font-mono text-primary">profiles</code> itself — the
            classic policy-recursion trap.
          </p>
          <p class="text-muted">
            <code class="font-mono text-primary">profiles.id</code> <em>is</em>
            the auth user id. No join table, no mapping to keep in sync.
          </p>
        </div>
      </div>
    </UContainer>

    <!-- 02 A real policy -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[1]!" />

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <CodeCard
          file="supabase/migrations/20260101000000_init.sql"
          :code="notesPolicy"
          lang="sql"
          :highlight="[3]"
        />

        <CodeCard
          file="supabase/migrations/20260101000000_init.sql"
          :code="signupTrigger"
          lang="sql"
          :highlight="[4]"
        />
      </div>

      <p class="mt-6 max-w-3xl text-sm text-muted">
        Roles are <code class="font-mono text-primary">member</code> and
        <code class="font-mono text-primary">admin</code>. The
        <code class="font-mono text-primary">definePageMeta({ roles })</code>
        gate on a page is UX — it decides what to show, never what can be read.
        The two live in different places on purpose.
      </p>
    </UContainer>

    <!-- 03 The test -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[2]!" />

      <div class="mt-10">
        <CodeCard
          file="e2e/tenant-isolation.spec.ts"
          :code="isolationTest"
          :highlight="[5, 14]"
        />
      </div>

      <p class="mt-6 max-w-3xl text-sm text-muted">
        It runs its own login rather than reusing the saved admin session, so it
        cannot accidentally pass by testing the wrong user. Widen a policy and
        this goes red.
      </p>
    </UContainer>

    <!-- 04 Hardening -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[3]!" />

      <div class="mt-10 grid gap-4 sm:grid-cols-2">
        <div
          v-for="item in hardening"
          :key="item.title"
          class="rounded-[var(--ui-radius)] border border-default bg-muted/40 p-5"
        >
          <UIcon
            :name="item.icon"
            class="size-5 text-primary"
          />
          <p class="mt-3 font-medium text-highlighted">
            {{ item.title }}
          </p>
          <p class="mt-1.5 text-sm text-muted">
            {{ item.detail }}
          </p>
        </div>
      </div>
    </UContainer>

    <!-- 05 The ceiling -->
    <UContainer class="py-16 sm:py-24">
      <SectionHead v-bind="page.sections[4]!" />

      <div class="mt-10 rounded-[var(--ui-radius)] border border-primary/40 bg-primary/5 p-6 sm:p-8">
        <p class="text-muted">
          <code class="font-mono text-primary">current_tenant_id()</code> reads
          the caller's profile row on every policy evaluation. That is one
          indexed primary-key lookup, cached per statement — fine well past the
          point most products get to, and wrong to optimise before then.
        </p>
        <p class="mt-4 text-muted">
          When it does start to hurt, the upgrade path is already written down:
          move <code class="font-mono text-primary">tenant_id</code> into a
          custom JWT claim via a Supabase access-token hook and read it from
          <code class="font-mono text-primary">auth.jwt()</code>. Same call
          sites, same policies, no per-request lookup.
        </p>
      </div>
    </UContainer>

    <!-- CTA -->
    <UContainer class="pb-24">
      <div class="flex flex-col items-start gap-6 rounded-[var(--ui-radius)] border border-default bg-muted/40 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xl font-semibold text-highlighted">
            See how the rest of it fits together.
          </p>
          <p class="mt-1 text-muted">
            Ten layers, the request lifecycle, and the type pipeline behind it.
          </p>
        </div>
        <UButton
          to="/architecture"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          label="Read the architecture"
        />
      </div>
    </UContainer>
  </div>
</template>
