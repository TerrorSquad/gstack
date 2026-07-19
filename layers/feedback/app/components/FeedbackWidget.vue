<script setup lang="ts">
// Floating "Feedback" button + modal. Self-hosted: submits straight to the DB
// via useFeedback (RLS-scoped). Rendered only when the subsystem is on and the
// user is signed in (feedback rows need a profile). Mounted once in app.vue.
const { public: cfg } = useRuntimeConfig()
const auth = useAuthStore()
const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const { submit } = useFeedback()

const open = ref(false)
const message = ref('')
const sending = ref(false)

const enabled = computed(() => cfg.feedbackEnabled && auth.isAuthenticated)

async function send() {
  if (!message.value.trim()) return
  sending.value = true
  try {
    await submit(message.value, route.fullPath)
    toast.add({ title: t('feedback.sent'), color: 'success' })
    message.value = ''
    open.value = false
  } catch {
    toast.add({ title: t('feedback.error'), color: 'error' })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="enabled">
    <UButton
      icon="i-lucide-message-square"
      color="neutral"
      class="fixed bottom-4 right-4 z-50 shadow-lg"
      :aria-label="t('feedback.open')"
      @click="open = true"
    >
      {{ t('feedback.button') }}
    </UButton>

    <UModal v-model:open="open" :title="t('feedback.title')">
      <template #content>
        <div class="flex flex-col gap-4 p-6">
          <h2 class="text-lg font-semibold">{{ t('feedback.title') }}</h2>
          <UTextarea
            v-model="message"
            :rows="5"
            :placeholder="t('feedback.placeholder')"
            autofocus
          />
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="open = false">
              {{ t('common.cancel') }}
            </UButton>
            <UButton :loading="sending" :disabled="!message.trim()" @click="send">
              {{ t('feedback.send') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
