import { test, expect, type Page } from '@playwright/test'
import { nav } from '../../src/content/nav'

// The header fits at every width (05 §4.2): no horizontal page scroll, a fixed 72px bar, the full menu on one row from 1280px,
// the sheet below it, and mega-menu panels inside the viewport.
const WIDTHS = [390, 1024, 1180, 1280, 1366, 1440, 1920]
const DESKTOP = 1280
const PATH = '/about-us/'
const topLabels = nav.menu.map((m) => m.label)

const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' })
const openPanel = (page: Page) => page.locator('[data-slot=navigation-menu-content][data-state=open]')

async function load(page: Page, width: number, height = 900) {
  await page.setViewportSize({ width, height })
  await page.goto(PATH, { waitUntil: 'networkidle' })
}

const noPageOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

for (const width of WIDTHS) {
  test(`header fits at ${width}px`, async ({ page }) => {
    await load(page, width)
    expect(await noPageOverflow(page)).toBe(true)

    const bar = page.locator('header').first()
    expect(Math.round((await bar.boundingBox())!.height)).toBe(73) // 72px bar + 1px border

    // header CTAs stay on one line (h-10)
    for (const cta of await bar.getByRole('link', { name: /enquire/i }).all()) {
      if (await cta.isVisible()) expect(Math.round((await cta.boundingBox())!.height)).toBe(40)
    }

    const burger = page.getByRole('button', { name: 'Open menu' })
    if (width < DESKTOP) {
      await expect(burger).toBeVisible()
      await expect(mainNav(page)).toBeHidden()
      return
    }
    await expect(burger).toBeHidden()
    const logo = (await bar.locator('a[href="/"]').first().boundingBox())!
    const firstCta = (await bar.getByRole('link', { name: /enquire/i }).filter({ visible: true }).first().boundingBox())!
    const boxes = []
    for (const label of topLabels) {
      const item = mainNav(page).getByRole(label === 'Home' ? 'link' : 'button', { name: label, exact: true })
      await expect(item).toBeVisible()
      boxes.push((await item.boundingBox())!)
    }
    // one row, between the logo and the CTAs, inside the viewport
    for (const b of boxes) {
      expect(Math.abs(b.y - boxes[0].y)).toBeLessThan(2)
      expect(b.x).toBeGreaterThanOrEqual(logo.x + logo.width)
      expect(b.x + b.width).toBeLessThanOrEqual(firstCta.x)
    }
  })
}

for (const width of [DESKTOP, 1440]) {
  test(`mega-menu panels stay in the viewport at ${width}px`, async ({ page }) => {
    await load(page, width, 800)
    const triggers = mainNav(page).locator('button[data-slot=navigation-menu-trigger]')
    const count = await triggers.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      const trigger = triggers.nth(i)
      await trigger.focus()
      await page.keyboard.press('Enter')
      const panel = openPanel(page)
      await expect(panel).toBeVisible()
      await page.waitForTimeout(250)
      const box = (await panel.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(width)
      expect(box.y + box.height).toBeLessThanOrEqual(800)
      expect(await noPageOverflow(page)).toBe(true)
      // keyboard: Tab reaches the first link inside the panel
      await page.keyboard.press('Tab')
      expect(await panel.evaluate((p) => p.contains(document.activeElement))).toBe(true)
      await page.keyboard.press('Escape')
      await expect(openPanel(page)).toHaveCount(0)
    }
  })
}

test('a tall panel scrolls inside a short viewport', async ({ page }) => {
  await load(page, DESKTOP, 460)
  await mainNav(page).getByRole('button', { name: 'Courses', exact: true }).click()
  const panel = openPanel(page)
  await expect(panel).toBeVisible()
  await page.waitForTimeout(250)
  const box = (await panel.boundingBox())!
  expect(box.y + box.height).toBeLessThanOrEqual(460)
  expect(await panel.evaluate((p) => p.scrollHeight > p.clientHeight && getComputedStyle(p).overflowY === 'auto')).toBe(true)
})

test('a panel closes on an outside click', async ({ page }) => {
  await load(page, DESKTOP, 800)
  await mainNav(page).getByRole('button', { name: 'Login', exact: true }).click()
  await expect(openPanel(page)).toBeVisible()
  await page.mouse.click(40, 700)
  await expect(openPanel(page)).toHaveCount(0)
})

test('the mobile sheet carries the whole menu, both CTAs, the phone and the utility links', async ({ page }) => {
  await load(page, 390, 844)
  await page.getByRole('button', { name: 'Open menu' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()
  for (const label of topLabels) await expect(sheet.getByText(label, { exact: true }).first()).toBeAttached()
  for (const cta of [nav.primaryCta, nav.secondaryCta]) if (cta) await expect(sheet.getByRole('link', { name: cta.label, exact: true })).toBeAttached()
  for (const l of nav.utilityLinks) await expect(sheet.getByRole('link', { name: l.label, exact: true })).toBeAttached()
  await expect(sheet.locator('a[href^="tel:"]')).toBeAttached()
  // the longest group opens without widening the sheet or the page
  await sheet.getByRole('button', { name: 'Courses', exact: true }).click()
  await page.waitForTimeout(300)
  expect(await sheet.evaluate((d) => d.scrollWidth <= d.clientWidth)).toBe(true)
  expect(await noPageOverflow(page)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(sheet).toHaveCount(0)
})
