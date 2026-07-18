<script setup lang="ts">
definePageMeta({ public: true, layout: 'marketing' })

// Placeholder legal text — replace with your own, reviewed by counsel. See the
// note in terms.vue for why this is static English, not i18n.
useSeoMeta({
  title: 'Privacy Policy',
  description: 'How this service collects, uses, and protects your data.',
})
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
    <h1 class="font-heading text-3xl font-bold">Privacy Policy</h1>
    <p class="mt-2 text-sm text-muted">Last updated: replace with a date.</p>

    <UAlert
      class="mt-6"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="Template placeholder"
      description="This is boilerplate. Replace it with a privacy policy that reflects what you actually collect (and applicable law, e.g. GDPR) before launch."
    />

    <div class="mt-8 space-y-6 text-toned">
      <section>
        <h2 class="text-xl font-semibold">Data we collect</h2>
        <p class="mt-2 text-sm/relaxed">
          Account details (name, email) and the content you create. Describe any analytics or
          third-party processors you use.
        </p>
      </section>
      <section>
        <h2 class="text-xl font-semibold">How we use it</h2>
        <p class="mt-2 text-sm/relaxed">
          To provide and improve the service, secure accounts, and communicate with you. We do not
          sell your data.
        </p>
      </section>
      <section>
        <h2 class="text-xl font-semibold">Your rights</h2>
        <p class="mt-2 text-sm/relaxed">
          You may access, correct, export, or delete your data. Explain how users exercise these
          rights and who to contact.
        </p>
      </section>
      <section>
        <h2 class="text-xl font-semibold">Contact</h2>
        <p class="mt-2 text-sm/relaxed">Add your data-protection contact address here.</p>
      </section>
    </div>
  </article>
</template>
