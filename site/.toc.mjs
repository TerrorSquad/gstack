import { chromium } from '@playwright/test'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:8901/docs/getting-started/introduction.html', { waitUntil: 'networkidle' })
const info = await p.evaluate(() => {
  const links = [...document.querySelectorAll('a[href^="#"]')]
  const clipped = links.filter(a => a.scrollWidth > a.clientWidth + 1)
  return clipped.slice(0, 3).map(a => ({
    text: a.textContent.trim().slice(0, 40),
    cls: a.className,
    parentCls: a.parentElement?.className || '',
    overflow: getComputedStyle(a).textOverflow,
  }))
})
console.log(JSON.stringify(info, null, 1))
await b.close()
