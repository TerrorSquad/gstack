import type { Page } from '@playwright/test'

import en from '../i18n/locales/en.json' with { type: 'json' }

// first segments of every i18n key ("nav", "items", …): a visible "<ns>.<word>" is an untranslated key
const NAMESPACES = [...new Set(Object.keys(en).map((k) => k.split('.')[0]!))]

/**
 * Deterministic layout rules, measured in the browser on the rendered page. Returns one line per problem.
 *  - nothing scrolls the page sideways, and nothing pokes out past the right edge
 *  - controls (buttons, links, inputs) never overlap each other
 *  - stacked blocks (cards, grids, tables, alerts, toolbars) keep at least BLOCK_GAP between them
 *  - a heading sits closer to its own content than to the block above it (proximity), with HEADING_GAP above
 *  - labels on buttons, table headers and headings are not cut off without an ellipsis
 *  - no translation key shows raw ("nav.erp.items") instead of its text
 *  - no Cyrillic on a Latin page (plain 'sr' handed to Intl printed month names as "нов, дец")
 */
export const BLOCK_GAP = 12
export const HEADING_GAP = 16

export function layoutProblems(page: Page): Promise<string[]> {
  return page.evaluate(
    ({ BLOCK_GAP, HEADING_GAP, NAMESPACES }) => {
      const out: string[] = []
      const vw = document.documentElement.clientWidth
      const name = (el: Element) => {
        const id = el.getAttribute('data-testid')
        const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30)
        return `<${el.tagName.toLowerCase()}${id ? ` ${id}` : ''}>${text ? ` "${text}"` : ''}`
      }
      // checkVisibility also sees through closed <details> (content-visibility: hidden keeps layout boxes)
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect()
        if (r.width < 2 || r.height < 2) return false
        return (
          el.checkVisibility({
            visibilityProperty: true,
            opacityProperty: true,
            contentVisibilityAuto: true,
          }) && !el.closest('[aria-hidden="true"], .sr-only, [inert]')
        )
      }
      // inside something that scrolls or clips on its own (grids, wide tables): its content may extend past the page
      const clipped = (el: Element) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const s = getComputedStyle(p)
          if (p.tagName === 'MAIN') return false
          if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true
        }
        return false
      }
      const floating = (el: Element) => {
        for (let p: Element | null = el; p && p !== document.body; p = p.parentElement) {
          const pos = getComputedStyle(p).position
          if (pos === 'fixed' || pos === 'sticky') return true
        }
        return false
      }
      const main = document.querySelector('main')
      if (!main) return out

      // 1. sideways
      if (document.documentElement.scrollWidth > vw + 1)
        out.push(
          `page scrolls sideways (${document.documentElement.scrollWidth}px wide in ${vw}px)`,
        )
      if (main.scrollWidth > main.clientWidth + 1)
        out.push(`content scrolls sideways (${main.scrollWidth}px wide in ${main.clientWidth}px)`)
      for (const el of main.querySelectorAll(
        'button, a[href], input, select, textarea, h1, h2, h3, table, [data-slot="root"]',
      )) {
        if (!visible(el) || clipped(el) || floating(el)) continue
        const r = el.getBoundingClientRect()
        if (r.right > vw + 1)
          out.push(`${name(el)} sticks out past the right edge by ${Math.round(r.right - vw)}px`)
      }

      // 2. overlapping controls
      const controls = [
        ...main.querySelectorAll(
          'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="combobox"]',
        ),
      ].filter((el) => visible(el) && !floating(el) && !el.closest('.ag-root-wrapper'))
      const box = controls.map((el) => el.getBoundingClientRect())
      for (let i = 0; i < controls.length; i++) {
        for (let j = i + 1; j < controls.length; j++) {
          const a = controls[i]!,
            b = controls[j]!
          if (a.contains(b) || b.contains(a)) continue
          // an input's own trailing/leading buttons (date picker, clear, show password) sit inside its box by design
          const fa = a.closest('[data-slot="root"]'),
            fb = b.closest('[data-slot="root"]')
          if (fa && fa === fb && (a.matches('input, textarea') || b.matches('input, textarea')))
            continue
          const ra = box[i]!,
            rb = box[j]!
          const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
          const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
          if (w > 2 && h > 2)
            out.push(`${name(a)} overlaps ${name(b)} (${Math.round(w)}x${Math.round(h)}px)`)
        }
      }

      // 3./4. vertical rhythm between stacked blocks
      type B = { el: Element; r: DOMRect; heading: boolean }
      const blocks: B[] = [
        ...main.querySelectorAll(
          'h2, h3, .ag-root-wrapper, [data-testid="grid-cards"], [data-testid="grid-toolbar"], table, [role="alert"], .surface-shadow[data-slot="root"], details',
        ),
      ]
        .filter(
          (el) =>
            visible(el) && !floating(el) && !el.closest('[role="dialog"], .ag-root-wrapper table'),
        )
        .map((el) => ({ el, r: el.getBoundingClientRect(), heading: /^H[23]$/.test(el.tagName) }))
      const related = (a: B, b: B) => a.el.contains(b.el) || b.el.contains(a.el)
      const overlapX = (a: DOMRect, b: DOMRect) =>
        Math.min(a.right, b.right) - Math.max(a.left, b.left) > 8
      const above = (b: B) => {
        let best: B | undefined
        for (const a of blocks) {
          if (a === b || related(a, b) || !overlapX(a.r, b.r) || a.r.bottom > b.r.top + 1) continue
          if (!best || a.r.bottom > best.r.bottom) best = a
        }
        return best
      }
      // the first visible element after the heading (its own content), and whether anything precedes it in its container
      const nextVisible = (el: Element): Element | undefined => {
        for (let n: Element | null = el; n && n !== main; n = n.parentElement) {
          for (let s = n.nextElementSibling; s; s = s.nextElementSibling) if (visible(s)) return s
        }
      }
      const leads = (el: Element) => {
        for (let s = el.previousElementSibling; s; s = s.previousElementSibling)
          if (visible(s)) return false
        return true
      }
      for (const b of blocks) {
        if (b.el.matches('[data-testid="grid-toolbar"]')) continue // part of the grid above it
        const a = above(b)
        if (!a || a.heading) continue // heading → sub-heading or heading → its own block: fine at any distance
        const gap = Math.round(b.r.top - a.r.bottom)
        if (b.heading) {
          if (leads(b.el)) continue // first thing in its card or section: the container's padding is its space
          if (gap < HEADING_GAP)
            out.push(
              `${name(b.el)} is only ${gap}px below ${name(a.el)} (heading needs ${HEADING_GAP}px)`,
            )
          const next = nextVisible(b.el)
          const own = next ? Math.round(next.getBoundingClientRect().top - b.r.bottom) : 0
          if (next && own > gap)
            out.push(
              `${name(b.el)} is closer to ${name(a.el)} above (${gap}px) than to its own content (${own}px)`,
            )
        } else if (gap < BLOCK_GAP) {
          out.push(
            `${name(b.el)} is only ${gap}px below ${name(a.el)} (blocks need ${BLOCK_GAP}px)`,
          )
        }
      }

      // 5. cut-off labels
      for (const el of main.querySelectorAll(
        'button, h1, h2, h3, th, label, [role="columnheader"] .ag-header-cell-text',
      )) {
        if (!visible(el) || (el.closest('.ag-root-wrapper') && !el.matches('.ag-header-cell-text')))
          continue
        const s = getComputedStyle(el)
        const cut =
          el.scrollWidth > el.clientWidth + 1 &&
          s.overflowX !== 'visible' &&
          s.textOverflow !== 'ellipsis'
        const text = (el.textContent ?? '').trim()
        if (cut && text)
          out.push(`${name(el)} is cut off (${el.scrollWidth}px of text in ${el.clientWidth}px)`)
      }

      // 6. raw translation keys (visible text of the whole page, so menus and dialogs count too; grid cells and [data-codes] text show codes on purpose)
      let text = ''
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const p = n.parentElement
        if (p && !p.closest('.ag-row, [data-codes], script, style') && p.checkVisibility())
          text += ` ${n.textContent}`
      }
      const keyRe = new RegExp(
        `\\b(?:${NAMESPACES.join('|')})\\.[a-z][A-Za-z0-9]*(?:\\.[A-Za-z0-9]+)*\\b`,
        'g',
      )
      for (const m of text.match(keyRe) ?? [])
        if (!/\.(com|rs|org|net|json|ts|vue)$/.test(m))
          out.push(`raw translation key on the page: ${m}`)
      // 7. the app writes Latin in both languages: Cyrillic means a locale slipped through as plain 'sr'
      for (const m of new Set(text.match(/[\u0400-\u04FF]+/g) ?? []))
        out.push(`Cyrillic text on a Latin page: ${m}`)
      return [...new Set(out)]
    },
    { BLOCK_GAP, HEADING_GAP, NAMESPACES },
  )
}
