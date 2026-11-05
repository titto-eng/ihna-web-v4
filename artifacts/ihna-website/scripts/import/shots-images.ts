// Screenshots of the pages that carry the imported photographs, at 1280 and 390 wide. Run: npx tsx scripts/import/shots-images.ts [baseUrl]
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { DEV_SITE_URL, OUT_DIR } from './lib/config'

const base = process.argv[2] ?? (process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL)
const pages: [string, string][] = [
  ['home', '/'], ['bon', '/courses/bachelor-of-nursing/'], ['diabetes', '/courses/diabetes-nursing/'], ['campus-brisbane', '/brisbane-campus/'],
  ['campus-melbourne', '/melbourne-campuses/'], ['campuses', '/campuses/'], ['our-people', '/our-people/'], ['staff-directory', '/staff-profile/'], ['courses', '/courses/'], ['staff-profile', '/dr-abhishek-sharma/'],
]
const dir = resolve(OUT_DIR, 'shots-images')
mkdirSync(dir, { recursive: true })
const browser = await chromium.launch()
for (const [w, h] of [[1280, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } })
  const page = await ctx.newPage()
  for (const [name, path] of pages) {
    const res = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60_000 }).catch(() => null)
    // lazy images: scroll through once so every frame is painted before the full-page capture
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } window.scrollTo(0, 0) })
    await page.waitForTimeout(600)
    await page.screenshot({ path: resolve(dir, `${name}-${w}.png`), fullPage: true })
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src))
    console.log(`${name}@${w} ${res?.status()} images=${await page.locator('img').count()} broken=${broken.length}${broken.length ? ' ' + broken.slice(0, 3).join(',') : ''}`)
  }
  await ctx.close()
}
await browser.close()
