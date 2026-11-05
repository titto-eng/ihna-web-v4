// Dev only: open the mobile sheet and the desktop mega-menu and screenshot both.
import { chromium } from '@playwright/test'
import { DEV_SITE_URL } from '../import/lib/config'

const base = (process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL).replace(/\/$/, '')
const browser = await chromium.launch()
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
await m.goto(`${base}/`, { waitUntil: 'networkidle' })
await m.getByRole('button', { name: 'Open menu' }).click()
await m.getByRole('button', { name: 'Courses' }).click()
await m.waitForTimeout(400)
await m.screenshot({ path: 'scripts/import/out/shots/nav-mobile.png' })
await m.keyboard.press('Escape')
console.log('sheet closed on Esc:', await m.getByRole('dialog').count() === 0)
const d = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
await d.goto(`${base}/`, { waitUntil: 'networkidle' })
await d.getByRole('button', { name: 'Courses' }).focus()
await d.keyboard.press('Enter')
await d.waitForTimeout(500)
await d.screenshot({ path: 'scripts/import/out/shots/nav-desktop.png', clip: { x: 0, y: 0, width: 1280, height: 520 } })
await browser.close()
