import { getDesignedPage } from '../utils/designedPages'

/**
 * SEO for the pages under `app/pages/`, matching what docus does for content.
 *
 * Docus's `[...slug].vue` and landing template call `useSeo()` + `defineOgImage()`,
 * which is where canonical URLs, Open Graph / Twitter meta and JSON-LD come from.
 * These pages previously called plain `useSeoMeta()`, so they shipped with
 * neither a canonical nor an OG image — verified in the built output, where
 * security.html had both missing while a docs page had both.
 *
 * That mattered more once the pages entered the sitemap: indexable, shareable,
 * and non-canonical.
 */
export function useDesignedPageSeo(path: string) {
  const page = getDesignedPage(path)

  useSeo({
    title: page.title,
    description: page.description,
    type: 'website',
  })

  defineOgImage('Landing', {
    // Matches docus's own truncation so the card doesn't overflow.
    title: page.heading.slice(0, 60),
    description: page.description,
  })

  return page
}
