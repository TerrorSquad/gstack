<script setup lang="ts">
import type { ContentNavigationItem, PageCollections } from '@nuxt/content'

/**
 * Overrides docus's AppSearch to include the pages under `app/pages/`.
 *
 * Docus searches `queryCollectionSearchSections('docs')` — @nuxt/content only.
 * The designed pages aren't content, so searching "RLS" never surfaced
 * /security, which is the page about RLS.
 *
 * UContentSearch builds its result groups by walking `navigation` and attaching
 * matching entries from `files`, so a page needs to be in BOTH to be findable.
 * Hence the two synthetic structures below, derived from `designedPages` — the
 * same data the pages render from, so the index can't describe a heading the
 * page doesn't have.
 */
const props = defineProps<{
  navigation?: ContentNavigationItem[]
}>()

const appConfig = useAppConfig()
const { forced: forcedColorMode } = useDocusColorMode()
const { locale, isEnabled } = useDocusI18n()

const collectionName = computed(() => (isEnabled.value ? `docs_${locale.value}` : 'docs') as keyof PageCollections)
const useFts = appConfig.search?.fts

const { data: docsFiles } = useFts
  ? { data: ref(null) }
  : useLazyAsyncData(`search_${collectionName.value}`, () => queryCollectionSearchSections(collectionName.value), {
      server: false,
      watch: [locale],
    })

const { search, status: searchStatus, init } = useFts
  ? useSearchCollection(collectionName, { immediate: false, ignoredTags: ['style'] })
  : { search: undefined, status: ref(undefined), init: () => {} }

if (useFts) {
  const { open } = useContentSearch()
  watch(open, (value) => {
    if (value && searchStatus.value === 'idle') {
      init()
    }
  })
}

// One entry for the page itself plus one per section, mirroring the shape
// queryCollectionSearchSections returns for markdown headings.
const designedFiles = computed(() =>
  designedPages.flatMap(page => [
    {
      id: page.path,
      title: page.heading,
      titles: [],
      level: 1,
      content: page.intro,
    },
    ...page.sections.map(section => ({
      id: `${page.path}#${section.index}`,
      title: section.title,
      titles: [page.heading],
      level: 2,
      content: [section.eyebrow, section.description].filter(Boolean).join(' — '),
    })),
  ]),
)

// Prepended as its own group so the designed pages read as a section of the
// site rather than as stray children of the docs tree.
const navigation = computed<ContentNavigationItem[]>(() => [
  {
    title: 'Product',
    path: '/product',
    children: designedPages.map(page => ({
      title: page.eyebrow,
      path: page.path,
      description: page.description,
    })),
  } as ContentNavigationItem,
  ...(props.navigation || []),
])

const files = computed(() => [...(docsFiles.value || []), ...designedFiles.value])

const links = computed(() => useFts
  ? navigation.value?.filter(item => item.children?.length).map(item => ({
      label: item.title,
      icon: item.icon,
      to: item.children![0]!.path,
    }))
  : undefined,
)
</script>

<template>
  <LazyUContentSearch
    :files="files"
    :search="search"
    :search-status="searchStatus"
    :links="links"
    :navigation="navigation"
    :color-mode="!forcedColorMode"
  />
</template>
