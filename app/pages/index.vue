<script setup lang="ts">
definePageMeta({ public: true })

const auth = useAuthStore()

await navigateTo(auth.isAuthenticated ? '/dashboard' : '/login')
</script>

<template>
  <div />
</template>
