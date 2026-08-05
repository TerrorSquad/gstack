# Social cards

Marketing images built from the same brand tokens as the app (amber
`--color-brand-500`, the dot-grid + glow from the auth canvas), so they can't
drift into looking like a different product.

| File | Size | Where it goes |
|---|---|---|
| `gstack-social-preview.png` | 1280×640 | GitHub → Settings → General → Social preview |
| `gstack-linkedin.png` | 1200×1200 | LinkedIn post attachment (square takes more mobile feed height) |

The `.html` files next to them are the sources. To regenerate after a rebrand,
open one in a browser and screenshot at 2× device scale, or drive it with
Playwright the way the originals were produced:

```ts
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 640 },
  deviceScaleFactor: 2,
})
await page.goto('file:///…/social-preview-1280x640.html')
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'gstack-social-preview.png' })
```

Two things to check on any edit:

- **Nothing overflows.** The first draft silently clipped `.toHaveCount(0)` off
  the right edge, which is a bad look on a card whose whole claim is about
  correctness. Assert `scrollWidth <= clientWidth` on `pre` rather than eyeballing it.
- **Stay under 1 MB.** GitHub rejects larger social previews.

> GitHub's social preview can only be set through the web UI. There is no REST
> endpoint for it, so this one upload stays manual.
