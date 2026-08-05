<script setup lang="ts">
// A filename-barred, syntax-highlighted code block for the designed pages.
//
// Highlighting runs through Shiki at PRERENDER time only: the import is behind
// `import.meta.server`, so Vite drops it from the client bundle, and
// useAsyncData serialises the resulting HTML into the payload. The browser gets
// coloured markup with no highlighter shipped to it.
//
// Code arrives as a `code` string rather than slot content on purpose: Vue's
// default `whitespace: 'condense'` collapses the newlines around any element in
// a slot, so a <pre> with an inline <span> renders as one long line.
const props = withDefaults(
  defineProps<{
    file: string
    code: string
    lang?: string
    /** 1-based line numbers to tint — points at the line that matters. */
    highlight?: number[]
  }>(),
  { lang: 'ts', highlight: () => [] },
)

// useAsyncData keys have to match between the prerender and the client so the
// payload is reused instead of refetched. Derive it from the content (djb2) —
// `file` alone isn't unique, some pages show two excerpts from one migration.
const key = computed(() => {
  let h = 5381
  const s = props.file + props.code
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return `code-${(h >>> 0).toString(36)}`
})

const { data: html } = await useAsyncData(key.value, async () => {
  if (!import.meta.server) return null

  const { codeToHtml } = await import('shiki')
  return codeToHtml(props.code, {
    lang: props.lang,
    // Dual themes emit both colours as CSS vars; docus already ships the
    // `html.dark .shiki span { color: var(--shiki-dark) }` rule that swaps them.
    themes: { light: 'github-light', dark: 'github-dark-default' },
    transformers: [
      {
        line(node, line) {
          if (props.highlight.includes(line)) {
            this.addClassToHast(node, 'line-highlighted')
          }
        },
      },
    ],
  })
})
</script>

<template>
  <div class="code-card rounded-[var(--ui-radius)] border border-default bg-elevated overflow-hidden">
    <div class="flex items-center gap-2 border-b border-default px-4 py-2.5">
      <span class="size-1.5 rounded-full bg-primary" />
      <span class="font-mono text-xs text-dimmed">{{ file }}</span>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- build-time Shiki output, no user input -->
    <div
      v-if="html"
      class="overflow-x-auto"
      v-html="html"
    />
    <pre
      v-else
      class="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-toned"
    >{{ code }}</pre>
  </div>
</template>

<style scoped>
.code-card :deep(pre.shiki) {
  background-color: transparent !important;
  padding: 1rem;
  font-size: 13px;
  line-height: 1.65;
}

.code-card :deep(pre.shiki code) {
  display: block;
  width: max-content;
  min-width: 100%;
}

/* docus ships `html.dark .shiki span { background-color: var(--shiki-dark-bg)
   !important }`, which paints every line with the Shiki theme's own background
   and hides the card surface behind it. Neutralise that inside the card... */
.code-card :deep(.shiki span) {
  background-color: transparent !important;
}

/* ...then re-apply the tint on the one line we're pointing at. Higher
   specificity than both rules above, so the !important contest resolves here.
   An amber wash plus a rule in the gutter, so it still reads for someone who
   can't distinguish the tint. */
.code-card :deep(.shiki .line.line-highlighted) {
  display: inline-block;
  width: 100%;
  margin: 0 -1rem;
  padding: 0 calc(1rem - 2px);
  border-left: 2px solid var(--ui-color-primary-500);
  background-color: color-mix(in oklch, var(--ui-color-primary-500) 14%, transparent) !important;
}
</style>
