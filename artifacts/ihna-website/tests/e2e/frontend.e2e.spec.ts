import { test, expect } from '@playwright/test'
import { site } from '../../src/content/site'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.status()).toBe(200)
    await expect(page).toHaveTitle(new RegExp(site.shortName))
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
