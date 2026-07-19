// Scaffolds a new feature layer: `pnpm gen:layer <name>`. Creates layers/<name>/
// with a nuxt.config.ts + a sample page, then prints the line to add to the root
// nuxt.config extends[]. See docs/adr/0005-nuxt-layers.md.
// ponytail: prints the extends line instead of editing nuxt.config.ts — string-
// patching the config array is fragile; paste the one line yourself.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const name = process.argv[2]
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: pnpm gen:layer <name>   (kebab-case, e.g. "reports")')
  process.exit(1)
}

const dir = join('layers', name)
if (existsSync(dir)) {
  console.error(`layers/${name} already exists — pick another name.`)
  process.exit(1)
}

const pageDir = join(dir, 'app', 'pages', name)
mkdirSync(pageDir, { recursive: true })

// Empty config is enough for Nuxt to treat the dir as a layer; the root `extends`
// is what actually wires it in.
writeFileSync(join(dir, 'nuxt.config.ts'), 'export default defineNuxtConfig({})\n')
writeFileSync(
  join(pageDir, 'index.vue'),
  `<script setup lang="ts">
// Auth is enforced by the root auth.global middleware. Make this public with
// definePageMeta({ public: true }), or gate by role with { roles: ['admin'] }.
const { t } = useI18n()
useHead({ title: '${name}' })
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold">${name}</h1>
  </UContainer>
</template>
`,
)

console.log(`✓ Created layers/${name}/ (nuxt.config.ts + app/pages/${name}/index.vue)`)
console.log(`\nAdd it to the root nuxt.config.ts extends[]:\n    './layers/${name}',\n`)
