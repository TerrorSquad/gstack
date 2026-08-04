<template>
  <!-- Overrides docus's AppFooterLeft, which renders a bare "Copyright © <year>"
       with no attribution — an open-source project with nobody's name on it
       gives a visitor no way to find who wrote it.

       Values are inline rather than read from app.config: this component is
       already site-specific, and pulling them through useAppConfig() only added
       indirection for a single consumer. -->
  <div class="text-sm text-muted">
    © {{ new Date().getFullYear() }}
    <ULink
      to="https://goranninkovic.com/"
      target="_blank"
      class="font-medium text-default hover:text-primary"
    >
      Goran Ninkovic
    </ULink>
    · MIT licensed
  </div>
</template>
