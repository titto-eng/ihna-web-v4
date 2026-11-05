// Dev only: print console errors/warnings a page logs on load. Usage: npx tsx scripts/dev/console.ts <url>
import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(m.type(), m.text().slice(0, 400)) })
page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 400)))
await page.goto(process.argv[2], { waitUntil: 'networkidle' })
await page.evaluate(() => document.documentElement.scrollWidth).then((w) => console.log('scrollWidth', w))
await browser.close()
