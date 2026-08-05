// Captures every page of the built docs site, full-page, in both themes.
//
// The starter has `pnpm screenshots` for the APP (docs/screenshots/, driven by
// Playwright against a seeded Supabase). This is the equivalent for the docs
// SITE, and deliberately separate: it needs no database, just `dist/`.
//
// Output lands in site/docs/screenshots/ and is committed, so design and copy
// can be reviewed — and diffed — without rebuilding and re-running a browser.
//
// Usage:  pnpm generate && pnpm screenshots
//
// It serves `dist/` itself rather than assuming a running server, and requests
// `<route>.html` explicitly: a plain static file server resolves `/stack` to a
// directory listing, while Cloudflare Pages resolves it to stack.html. That
// mismatch is a local artefact, not a production one.
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(siteDir, 'dist')
const outDir = join(siteDir, 'docs', 'screenshots')

const ROUTES = [
  ['index', 'Landing'],
  ['stack', 'The stack'],
  ['architecture', 'Architecture'],
  ['security', 'Security'],
  ['docs/getting-started/introduction', 'Docs — Introduction'],
  ['docs/getting-started/installation', 'Docs — Installation'],
  ['docs/getting-started/configuration', 'Docs — Configuration'],
  ['docs/architecture/layers', 'Docs — Layers'],
  ['docs/architecture/multi-tenancy', 'Docs — Multi-tenancy'],
  ['docs/architecture/testing', 'Docs — Testing'],
  ['docs/reference/commands', 'Docs — Commands'],
  ['docs/reference/decisions', 'Docs — Decisions'],
]

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.wasm': 'application/wasm',
}

if (!existsSync(distDir)) {
  console.error('No dist/ — run `pnpm generate` first.')
  process.exit(1)
}

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const file = join(distDir, path === '/' ? 'index.html' : path)
  if (!file.startsWith(distDir) || !existsSync(file)) {
    res.writeHead(404).end('not found')
    return
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})

await new Promise(resolve => server.listen(0, resolve))
const base = `http://localhost:${server.address().port}`

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const problems = []

for (const [route, label] of ROUTES) {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))

    await page.goto(`${base}/${route}.html`, { waitUntil: 'networkidle' })
    await page.evaluate((t) => {
      document.documentElement.classList.toggle('dark', t === 'dark')
      document.documentElement.style.colorScheme = t
    }, theme)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)

    const name = `${route.replace(/\//g, '-')}-${theme}.png`
    await page.screenshot({ path: join(outDir, name), fullPage: true })

    // Cheap regressions worth catching while a browser is already open:
    // horizontal overflow, and text clipped to an ellipsis.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll('a,span,p,li,h1,h2,h3')]
        .filter(e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 40 && e.textContent.trim().length > 8)
        .map(e => e.textContent.trim().slice(0, 40)).slice(0, 5))

    if (errors.length) problems.push(`${label} (${theme}): console — ${errors[0]}`)
    if (overflow) problems.push(`${label} (${theme}): page scrolls horizontally`)
    if (clipped.length) problems.push(`${label} (${theme}): clipped text — ${clipped.join(' / ')}`)

    await page.close()
  }
  console.log(`  ${label}`)
}

await browser.close()
server.close()

console.log(`\n${ROUTES.length * 2} screenshots → site/docs/screenshots/`)
if (problems.length) {
  console.log(`\n${problems.length} issue(s):`)
  for (const p of problems) console.log(`  - ${p}`)
}
else {
  console.log('No console errors, horizontal overflow or clipped text.')
}
