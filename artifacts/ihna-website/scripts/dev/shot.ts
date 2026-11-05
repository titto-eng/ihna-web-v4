// Dev only: full-page screenshots of a page in slices, scrolling first so lazy images load.
// Usage: npx tsx scripts/dev/shot.ts <url> <width> <outPrefix> [sliceHeight]
import { chromium } from '@playwright/test'

const [url, width, prefix, slice = '1600'] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, reducedMotion: 'reduce' })
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 })
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
  window.scrollTo(0, 0)
})
await page.waitForTimeout(800)
const h = await page.evaluate(() => document.documentElement.scrollHeight)
await page.screenshot({ path: `${prefix}.png`, fullPage: true })
let i = 0
for (let y = 0; y < h; y += Number(slice)) {
  await page.screenshot({ path: `${prefix}-${String(i++).padStart(2, '0')}.png`, fullPage: true, clip: { x: 0, y, width: Number(width), height: Math.min(Number(slice), h - y) } })
}
console.log(`height ${h}, ${i} slices`)
await browser.close()
