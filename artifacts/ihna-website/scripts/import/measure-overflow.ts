// 390 px horizontal-overflow check: document.documentElement.scrollWidth must equal 390. Run: npx tsx scripts/import/measure-overflow.ts [baseUrl]
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { DEV_SITE_URL, OUT_DIR } from './lib/config'

const base = process.argv[2] ?? (process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL)
const pages: [string, string][] = [['bon', '/courses/bachelor-of-nursing/'], ['home', '/'], ['our-people', '/our-people/'], ['landing', '/automated-gcan-enrolment/'], ['diabetes', '/courses/diabetes-nursing/']]
const dir = resolve(OUT_DIR, 'shots-images')
mkdirSync(dir, { recursive: true })
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage()
let bad = 0
for (const [name, path] of pages) {
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60_000 })
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  await page.screenshot({ path: resolve(dir, `overflow-${name}-390.png`), fullPage: true })
  console.log(`${path} scrollWidth=${sw}`)
  if (sw !== 390) bad++
}
await browser.close()
process.exit(bad ? 1 : 0)
