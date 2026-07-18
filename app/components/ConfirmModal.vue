<script setup lang="ts">
const { confirmState } = useConfirm()
const { t } = useI18n()

const open = computed({
  get: () => confirmState.value !== null,
  set: (v) => {
    if (!v) {
      confirmState.value?.resolve(false)
      confirmState.value = null
    }
  },
})

function answer(confirmed: boolean) {
  confirmState.value?.resolve(confirmed)
  confirmState.value = null
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="flex flex-col gap-5 p-6">
        <p class="text-sm whitespace-pre-line">{{ confirmState?.message }}</p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="answer(false)">
            {{ t('common.cancel') }}
          </UButton>
          <UButton color="error" @click="answer(true)">
            {{ t('common.confirm') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
