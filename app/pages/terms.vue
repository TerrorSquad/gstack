<script setup lang="ts">
definePageMeta({ public: true, layout: 'marketing' })

// Placeholder legal text — replace with your own, reviewed by counsel. Kept as
// static English (not i18n) on purpose: legal copy is jurisdiction-specific and
// authored per project, not translated from a starter's keys.
useSeoMeta({
  title: 'Terms of Service',
  description: 'The terms governing use of this service.',
})
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
    <h1 class="font-heading text-3xl font-bold">Terms of Service</h1>
    <p class="mt-2 text-sm text-muted">Last updated: replace with a date.</p>

    <UAlert
      class="mt-6"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="Template placeholder"
      description="This is boilerplate. Replace it with your own Terms of Service, reviewed by a lawyer, before launch."
    />

    <div class="mt-8 space-y-6 text-toned">
      <section>
        <h2 class="text-xl font-semibold">1. Agreement</h2>
        <p class="mt-2 text-sm/relaxed">
          By accessing or using this service, you agree to be bound by these terms. If you do not
          agree, do not use the service.
        </p>
      </section>
      <section>
        <h2 class="text-xl font-semibold">2. Accounts</h2>
        <p class="mt-2 text-sm/relaxed">
          You are responsible for safeguarding your account and for any activity under it. Provide
          accurate information and keep it up to date.
        </p>
      </section>
      <section>
        <h2 class="text-xl font-semibold">3. Acceptable use</h2>
        <p class="mt-2 text-sm/relaxed">
          Do not misuse the service, attempt to disrupt it, or use it to break the law or infringe
          others' rights.
        </p>
      </section>
      <section>
        <h2 class="text-xl font-semibold">4. Termination</h2>
        <p class="mt-2 text-sm/relaxed">
          We may suspend or terminate access for violations of these terms. You may stop using the
          service at any time.
        </p>
      </section>
      <section>
        <h2 class="text-xl font-semibold">5. Contact</h2>
        <p class="mt-2 text-sm/relaxed">Questions about these terms? Add your contact address here.</p>
      </section>
    </div>
  </article>
</template>
