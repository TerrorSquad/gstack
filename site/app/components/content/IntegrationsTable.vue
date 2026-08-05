<script setup lang="ts">
// Used from markdown as `::integrations-table`. Renders the subsystem table
// straight from the starter's manifest — see app/utils/integrations.ts for why
// this isn't hand-written any more.
</script>

<template>
  <div class="overflow-x-auto my-5">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-default text-left">
          <th class="py-2 pe-4 font-semibold text-highlighted">
            Subsystem
          </th>
          <th class="py-2 pe-4 font-semibold text-highlighted">
            Switch
          </th>
          <th class="py-2 font-semibold text-highlighted">
            Needs an account
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="s in subsystems"
          :key="s.id"
          class="border-b border-default/60 align-top"
        >
          <td class="py-2.5 pe-4 text-toned whitespace-nowrap">
            {{ s.label }}
          </td>
          <td class="py-2.5 pe-4">
            <code
              v-if="s.flag"
              class="font-mono text-xs text-primary"
            >{{ s.flag }}</code>
            <span
              v-else
              class="text-xs text-dimmed"
            >
              no flag — set {{ s.requiredKeys.length }}
              {{ s.requiredKeys.length === 1 ? 'key' : 'keys' }}
            </span>
          </td>
          <td class="py-2.5">
            <span
              v-if="s.account"
              class="text-muted"
            >{{ s.account }}</span>
            <span
              v-else
              class="text-success"
            >No — self-hosted</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
